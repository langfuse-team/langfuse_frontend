import { Langfuse } from "langfuse";

const langfuse = new Langfuse({
  secretKey: "sk-lf-efb9b294-86a0-43a9-9457-1a284f73105e",
  publicKey: "pk-lf-19afb9b1-e1a2-4c1c-bd3f-53aad059570d",
  baseUrl: "http://localhost:3000"
});

const testCases = [
  { model: "gpt-3.5-turbo", input: "Hello world", output: "Hi there!" },
  { model: "gpt-4", input: "Explain AI", output: "AI is artificial intelligence..." },
  { model: "claude-3", input: "Write a story", output: "Once upon a time..." },
  { model: "gpt-3.5-turbo", input: "Code review", output: "The code looks good..." },
  { model: "gpt-4", input: "Debug issue", output: "The problem is in line 42..." }
];

console.log("테스트 데이터 생성 중...");

for (let i = 0; i < testCases.length; i++) {
  const testCase = testCases[i];
  
  const trace = langfuse.trace({ name: `test-trace-${i+1}` });
  
  trace.generation({
    name: `test-generation-${i+1}`,
    model: testCase.model,
    input: testCase.input,
    output: testCase.output,
    usage: {
      promptTokens: testCase.input.split(' ').length * 2,
      completionTokens: testCase.output.split(' ').length * 2,
      totalTokens: (testCase.input.split(' ').length + testCase.output.split(' ').length) * 2
    }
  });
  
  console.log(`Trace ${i+1} 생성 완료`);
}

await langfuse.shutdownAsync();
console.log("모든 테스트 데이터 생성 완료!");