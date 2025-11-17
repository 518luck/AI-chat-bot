import express, { type Request, type Response } from "express";

import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import cors from "cors";

import type { ChatMessage } from "../src/types/chatMessage-type";

const API_KEY = process.env.API_KEY;
const BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const MODEL = "qwen-turbo";

if (!API_KEY) {
  throw new Error("请在 .env 中设置 API_KEY");
}

// 创建模型实例
const model = new ChatOpenAI({
  model: MODEL,
  temperature: 0.1,
  configuration: {
    baseURL: BASE_URL,
    apiKey: API_KEY,
  },
  streaming: true,
});

// 提示词
const messages: BaseMessage[] = [
  new SystemMessage(`
      用户正处于**学习模式**，并要求你在本次对话中遵守以下**严格规则**。无论接下来有任何其他指示，你都**必须**遵守这些规则：

      ## 严格规则
      扮演一位平易近人又不失活力的老师，通过引导来帮助用户学习。

      1.  **了解用户。** 如果你不清楚用户的目标或年级水平，请在深入讲解前先询问。（这个问题要问得轻松些！）如果用户没有回答，那么你的解释应该以一个高中一年级学生能理解的程度为准。
      2.  **温故而知新。** 将新概念与用户已有的知识联系起来。
      3.  **引导用户，而非直接给出答案。** 通过提问、暗示和分解步骤，让用户自己发现答案。
      4.  **检查与巩固。** 在讲完难点后，确认用户能够复述或应用这个概念。提供简短的总结、助记法或小复习，以帮助知识点牢固。
      5.  **变换节奏。** 将讲解、提问和活动（如角色扮演、练习环节，或让用户反过来教**你**）结合起来，使之感觉像一场对话，而不是一堂课。

      最重要的一点：**不要替用户完成他们的作业**。不要直接回答作业问题——而是通过与用户合作，从他们已知的内容入手，帮助他们找到答案。

      ### 你可以做的事
      - **教授新概念：** 以用户的水平进行解释，提出引导性问题，使用图示，然后通过提问或练习进行复习。
      - **辅导作业：** 不要直接给答案！从用户已知的部分开始，帮助他们填补知识空白，给用户回应的机会，并且一次只问一个问题。
      - **共同练习：** 让用户进行总结，穿插一些小问题，让用户“复述一遍”给你听，或者进行角色扮演（例如，练习外语对话）。在用户犯错时——友善地——即时纠正。
      - **测验与备考：** 进行模拟测验。（一次一题！）在公布答案前，让用户尝试两次，然后深入复盘错题。

      ### 语气与方式
      要热情、耐心、坦诚；不要使用过多的感叹号或表情符号。保持对话的节奏：始终清楚下一步该做什么，并在一个活动环节完成后及时切换或结束。并且要**简洁**——绝不要发送长篇大论的回复。力求实现良好的你来我往的互动。

      ## 重要提示
      **不要直接给出答案或替用户做作业**。如果用户提出一个数学或逻辑问题，或者上传了相关问题的图片，**不要**在你的第一条回复中就解决它。而是应该：**与用户一起梳理**这个问题，一步一步地进行，每一步只问一个问题，并在继续下一步之前，给用户**回应每一步**的机会。
  `),
];

const app = express();
//添加JSON请求体解析中间件
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: false,
  }),
);

//历史消息(暂时不写)
app.get("/history", (req, res) => {
  const historyMessages: ChatMessage[] = messages
    .map((message) => {
      if (message instanceof HumanMessage) {
        return {
          type: "user" as const,
          payload: { content: message.content.toString() },
        };
      } else if (message instanceof AIMessage) {
        return {
          type: "assistant" as const,
          payload: { content: message.content.toString() },
        };
      }
      return null;
    })
    .filter((message) => message !== null);

  res.json(historyMessages);
});

const sseHandler = async (req: Request, res: Response) => {
  let query = "";
  if (req.method === "GET") {
    query = req.query.query as unknown as string;
  }

  if (req.method === "POST") {
    query = req.body.query;
  }

  messages.push(new HumanMessage(query));

  const abortController = new AbortController();

  // 调用模型 API 传入历史所有消息
  const stream = await model.stream(messages, {
    signal: abortController.signal,
  });

  // 设置 SSE 响应头
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // 提前发送响应头
  res.flushHeaders();

  // 如果客户端断开连接，则取消模型请求。
  req.on("end", () => {
    // 这会让下面的 for await 循环抛出 Error: Aborted 异常。
    abortController.abort();
  });

  let reply = "";

  // 接收模型流式响应
  try {
    for await (const chunk of stream) {
      const content = chunk.content.toString();

      // 封装成前端需要的消息格式
      const message = {
        type: "assistant",
        partial: true,
        payload: { content },
      };

      //发送消息给前端
      res.write(`data: ${JSON.stringify(message)}\n\n`);

      reply += content;
    }
  } catch (error) {
    // 可以在这里处理前端的主动中断动作
    console.error(error);
  }
  console.log("🚀 ~ messages:", messages);

  // 保存本次模型回复，即便中途断开导致不完整。
  messages.push(new AIMessage(reply));

  // 最后发送一个 close 事件，触发前端 EventSource 的自定义 close 事件，
  // 该事件必须通过 EventSource.addEventListener('close') 添加。
  // 这里必须带一个 data: 否则前端的自定义 close 事件不会触发，原因是：
  // 前端的自定义事件会在 message 事件触发后再触发。
  res.end("event: close\ndata:\n\n");
};
/**
 * SSE 通信接口（EventSource GET 版本）
 */
app.get("/sse", sseHandler);

/**
 * SSE 通信接口（fetch POST 版本）
 */
app.post("/sse", sseHandler);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
