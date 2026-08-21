---
title: "Agent 写不好代码，可能是工具设计得太差（Writing effective tools for agents—with agents）"
date: 2026-08-09
tags: [翻译, agent, ai-coding, tool-use, mcp, agent-infra]
summary: "Anthropic 将 Agent 工具视为确定性软件与非确定性模型之间的接口，提出一套评估驱动的设计方法：围绕真实工作流选择少量高价值工具，以清晰的命名空间、参数和描述降低误用，并通过高信号、可控长度且能指导下一步的响应提高任务成功率。"
original: "https://www.anthropic.com/engineering/writing-tools-for-agents"
---
# Agent 写不好代码，可能是工具设计得太差

## 精选点评

做 Agent Harness，核心工作之一就是设计良好的工具系统。工具设计会直接影响 Agent 的效果。

我在实践 Agent 工程过程中，对工具有几点认识：

- **CLI 优于 MCP**：MCP 启用后通常会将大量工具描述加载到上下文中。开启过多不常用的 MCP，会让工具描述挤占上下文，在提高成本的同时降低效果。即使上下文窗口已经达到 1M Token，受限于 LLM 的注意力机制，模型在长上下文中的表现依然会明显下降。能够使用 Bash 工具时，CLI + Skill 往往是更轻量的方案。
- **Tool Search 可能是未来的方案**：Claude Code 正在通过 Tool Search 实现渐进式披露，但目前仍是 Beta 功能。暂时没有找到中立、公允的效果对比评测，现有材料大多带有推广自家产品的立场。
- **工具不需要太多**：Pi Agent 只有最基本的文件读写和 Bash 工具，但随着模型能力提升，效果并不差；同时 Token 消耗更少、速度更快。配合 V4 Flash 时响应非常迅速，我现在大部分非编码任务都使用 Pi + V4 Flash。

Anthropic 对工具的优化采用评估驱动的方法，确实专业且严谨，但个人或小团队完整实施的成本较高。对这类团队而言，掌握并贯彻高质量工具的设计原则，通常有更高的投入产出比。

工具设计方法论：
- 聚合同领域相关工具，避免工具数量膨胀。
- 控制工具返回结果，避免无关内容。
- 工具错误原因尽可能精准，否则LLM很容易陷入重复调用直到最大轮数。
- 

## 全文总结

这篇文章的核心判断是：**Agent 的实际能力不只取决于底层模型，也取决于工具是否以 Agent 能理解和可靠使用的方式被设计出来。**传统函数和 API 建立的是确定性系统之间的契约；Agent 工具连接的却是确定性软件与非确定性模型。同一个任务中，Agent 可能选错工具、填错参数、漏掉必要调用，也可能误读返回结果。因此，不能把现有 API 端点简单包装成工具后就期待 Agent 自动用好，而应把工具当成一种专门面向模型认知方式和上下文限制的交互界面。

Anthropic 建议从快速原型开始：先让开发者和真实用户亲自试用，暴露命名、参数、返回结构和工作流上的摩擦；随后建立贴近生产环境的评估集。评估任务不能只是单步搜索或指定 ID 查询，而应覆盖需要多次工具调用、信息整合和决策判断的真实任务。每项任务都要有可验证的结果，同时避免把验证器写得过于严格，也不要规定唯一的工具调用路径，以免将工具优化到某一种固定策略上。

评估不应只看最终正确率，还要观察任务耗时、工具调用次数、Token 消耗、错误率和完整调用轨迹。Agent 自己给出的反馈并不充分：它可能无法准确解释自己的行为，也未必知道正确策略。真正有价值的证据往往来自原始 transcript，例如是否重复调用、为何传入无效参数、在哪一步被返回格式误导。Anthropic 进一步用 Claude Code 批量分析这些轨迹、重构工具实现与描述，并通过保留测试集验证改动，避免在“训练”评估上过拟合。

在工具选择上，文章反对照搬底层 API 或无限增加工具数量。LLM 的稀缺资源是上下文和注意力，因此工具应围绕高价值工作流提供符合人类任务分解方式的能力，并在内部合并频繁串联的低层操作。例如，与其暴露“列出用户、列出日程、创建日程”三个接口，不如提供能查找空闲时间并完成安排的 `schedule_event`；与其返回全部日志，不如让 `search_logs` 只返回命中行及必要上下文。这样既减少工具选择空间，也避免大量中间结果占用上下文。

工具的命名、描述和参数本身就是提示词的一部分。相关工具应采用清晰的命名空间，显式说明服务和资源边界；但前缀还是后缀更好并无统一答案，应由目标模型和实际评估决定。工具描述要像向新同事交接一样，写清查询语法、领域术语、资源关系、输入输出和限制，并用严格的数据模型消除歧义，例如使用 `user_id` 而非含义不明的 `user`。文章强调，即使只是微调描述，也可能显著改变 Agent 的调用行为和任务成功率。

工具响应需要同时优化**信息质量**与**信息数量**。默认只返回与后续行动直接相关的高信号字段，优先使用有语义的名称和可解释标识，而不是让 Agent 处理大量 UUID、MIME 类型等底层细节；确实需要技术 ID 来串联后续调用时，可提供 `concise` / `detailed` 等响应模式。对于可能产生大量内容的工具，应配置合理的分页、范围、过滤和截断默认值，并在截断或报错时明确告诉 Agent 如何缩小查询、翻页或修正参数。XML、JSON、Markdown 哪种结构最好同样没有通用结论，必须在具体任务和模型上评估。

最终，文章给出的是一套闭环方法：**原型 → 真实任务评估 → 阅读轨迹和指标 → 修改工具实现、schema 与描述 → 用保留测试集复验。**高质量工具并非功能最多或接口最通用，而是用途清晰、上下文节制、容易组合，并能自然引导 Agent 完成真实工作。随着模型和 MCP 等交互机制演进，这套评估驱动的方法比任何一组静态“最佳实践”更重要。

## 要点总结

1. **工具是跨越确定性与非确定性的契约。** 普通 API 面向可预测的程序调用者，Agent 工具则必须容纳选错工具、参数误解、漏调用和误读响应等不确定行为。
2. **不要直接把底层 API 端点逐个包装成工具。** 应围绕真实、高价值工作流设计少量能力明确的工具，必要时在工具内部合并频繁串联的多步操作。
3. **Agent 的稀缺资源是上下文和注意力。** 搜索、过滤和聚合应尽量在工具侧完成，避免把全量联系人、日志或记录丢给模型逐 Token 扫描。
4. **评估任务必须贴近生产复杂度。** 优先使用需要多次调用、跨资源检索、信息整合和决策的任务，而不是只验证某个端点能否被调用。
5. **结果要可验证，但不要把策略写死。** 验证器应接受格式差异和合理的替代表述，也应允许 Agent 通过多条有效路径完成任务，避免过拟合固定调用序列。
6. **评估不只看最终正确率。** 同时记录耗时、调用次数、Token 消耗、工具错误和原始 transcript，借此发现重复调用、分页不合理、参数误用和工具边界重叠。
7. **Agent 的自我解释不能代替行为证据。** 它可能遗漏关键问题，也未必知道正确答案；分析时应把工具调用、响应和最终结果结合起来阅读。
8. **命名空间可以降低选错工具的概率。** 按服务和资源建立清晰边界，但采用前缀还是后缀要通过目标模型上的评估决定。
9. **工具描述和 schema 本身就是提示工程。** 应显式写出隐含知识、输入输出、术语、约束和示例，并使用 `user_id` 这类无歧义参数名与严格数据模型。
10. **响应应优先提供高信号、可行动的上下文。** 自然语言名称和有语义的字段通常比 UUID 等底层标识更可靠；需要串联调用时，再按需返回技术 ID。
11. **同时控制响应质量和长度。** 为大结果集提供分页、范围、过滤、截断和合理默认值；错误与截断消息应直接说明下一步如何修正。
12. **输出格式没有放之四海而皆准的答案。** XML、JSON、Markdown，以及 `concise` / `detailed` 的取舍，都应由具体模型、任务和评估结果决定。
13. **用 Agent 优化 Agent 的工具。** Claude Code 可分析大量评估轨迹并批量修改实现和描述，但改动仍需由独立保留测试集验证。
14. **工具设计是持续迭代，不是一次性写 schema。** 稳定的方法是“原型—评估—分析—修改—复验”的闭环，而不是凭直觉堆功能。

## 内容原文（沉浸式翻译）

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro) can empower LLM agents with potentially hundreds of tools to solve real-world tasks. But how do we make those tools maximally effective?

[模型上下文协议（MCP）](https://modelcontextprotocol.io/docs/getting-started/intro) 可以让 LLM Agent 使用多达数百种工具来解决现实世界中的任务。但怎样才能让这些工具尽可能有效？

In this post, we describe our most effective techniques for improving performance in a variety of agentic AI systems.[^1]

在本文中，我们将介绍在各类智能体 AI 系统中提升性能最有效的方法。[^1]

We begin by covering how you can:
- Build and test prototypes of your tools
- Create and run comprehensive evaluations of your tools with agents
- Collaborate with agents like Claude Code to automatically increase the performance of your tools

首先，我们将介绍如何：
- 构建和测试工具原型
- 创建并运行全面的 Agent 工具使用评估
- 与 Claude Code 等 Agent 协作，自动提升工具性能

We conclude with key principles for writing high-quality tools we’ve identified along the way:
- Choosing the right tools to implement (and not to implement)
- Namespacing tools to define clear boundaries in functionality
- Returning meaningful context from tools back to agents
- Optimizing tool responses for token efficiency
- Prompt-engineering tool descriptions and specs

最后，我们将总结在此过程中提炼出的高质量工具设计原则：
- 选择应该实现和不应该实现的工具
- 使用命名空间划分清晰的功能边界
- 向 Agent 返回有意义的上下文
- 优化工具响应的 Token 效率
- 通过提示工程改进工具描述和规格

![This is an image depicting how an engineer might use Claude Code to evaluate the efficacy of agentic tools.](https://www-cdn.anthropic.com/images/4zrzovbb/website/cdc027ad2730e4732168bb198fc9363678544f99-1920x1080.png)


Building an evaluation allows you to systematically measure the performance of your tools. You can use Claude Code to automatically optimize your tools against this evaluation.

构建评估体系，可以系统地衡量工具性能。你还可以使用 Claude Code，针对这套评估自动优化工具。

## What is a tool?

## 什么是工具？

In computing, deterministic systems produce the same output every time given identical inputs, while *non-deterministic* systems—like agents—can generate varied responses even with the same starting conditions.

在计算领域，确定性系统在输入相同时每次都会产生相同输出；非确定性系统（例如 Agent）即使初始条件相同，也可能生成不同结果。

When we traditionally write software, we’re establishing a contract between deterministic systems. For instance, a function call like `getWeather(“NYC”)` will always fetch the weather in New York City in the exact same manner every time it is called.

传统软件开发中，我们建立的是确定性系统之间的契约。例如，调用`getWeather("NYC")`这样的函数时，每次执行都会以完全相同的方式获取纽约市的天气。

Tools are a new kind of software which reflects a contract between deterministic systems and non-deterministic agents. When a user asks "Should I bring an umbrella today?,” an agent might call the weather tool, answer from general knowledge, or even ask a clarifying question about location first. Occasionally, an agent might hallucinate or even fail to grasp how to use a tool.

工具是一类新的软件，它建立了确定性系统与非确定性 Agent 之间的契约。当用户问“今天要带伞吗？”时，Agent 可能调用天气工具、根据常识回答，也可能先追问所在位置。它偶尔还会产生幻觉，甚至根本没有理解工具该怎么使用。

This means fundamentally rethinking our approach when writing software for agents: instead of writing tools and [MCP servers](https://modelcontextprotocol.io/) the way we’d write functions and APIs for other developers or systems, we need to design them for agents.

这意味着为智能体开发软件需要从根本上重新思考方法：我们不应像为开发者或系统编写函数和API那样编写工具和[MCP服务器](https://modelcontextprotocol.io/)，而必须为智能体设计它们。

Our goal is to increase the surface area over which agents can be effective in solving a wide range of tasks by using tools to pursue a variety of successful strategies. Fortunately, in our experience, the tools that are most “ergonomic” for agents also end up being surprisingly intuitive to grasp as humans.

我们的目标是扩大 Agent 能够有效解决问题的范围，让它们借助工具尝试多种可能成功的策略。幸运的是，根据我们的经验，对 Agent 最“顺手”的工具，往往也出人意料地容易被人类理解和使用。

## How to write tools

## 如何编写工具

In this section, we describe how you can collaborate with agents both to write and to improve the tools you give them. Start by standing up a quick prototype of your tools and testing them locally. Next, run a comprehensive evaluation to measure subsequent changes. Working alongside agents, you can repeat the process of evaluating and improving your tools until your agents achieve strong performance on real-world tasks.

本节介绍如何借助 Agent 编写并改进提供给它们的工具。先快速搭建工具原型并在本地测试，再运行完整评估来衡量后续改动。与 Agent 协作，反复执行评估和改进，直到它们能在现实任务中取得稳定的高质量表现。

### Building a prototype

### 构建原型

It can be difficult to anticipate which tools agents will find ergonomic and which tools they won’t without getting hands-on yourself. Start by standing up a quick prototype of your tools. If you’re using [Claude Code](https://www.anthropic.com/claude-code) to write your tools (potentially in one-shot), it helps to give Claude documentation for any software libraries, APIs, or SDKs (including potentially the [MCP SDK](https://modelcontextprotocol.io/docs/sdk)) your tools will rely on. LLM-friendly documentation can commonly be found in flat `llms.txt` files on official documentation sites (here’s our [API’s](https://docs.anthropic.com/llms.txt)).

如果不亲自上手，很难预判 Agent 会觉得哪些工具顺手、哪些不顺手。可以先快速搭建一个工具原型。如果使用 [Claude Code](https://www.anthropic.com/claude-code) 编写工具，甚至希望一次生成完成，最好向 Claude 提供工具所依赖的软件库、API 或 SDK 文档，其中也可能包括 [MCP SDK](https://modelcontextprotocol.io/docs/sdk)。适合 LLM 阅读的文档通常可以在官方文档站点的 `llms.txt` 文件中找到，例如我们的 [API 文档](https://docs.anthropic.com/llms.txt)。

Wrapping your tools in a [local MCP server](https://modelcontextprotocol.io/docs/develop/connect-local-servers) or [Desktop extension](https://www.anthropic.com/engineering/desktop-extensions) (DXT) will allow you to connect and test your tools in Claude Code or the Claude Desktop app.

将工具封装为[本地 MCP 服务器](https://modelcontextprotocol.io/docs/develop/connect-local-servers)或[桌面扩展](https://www.anthropic.com/engineering/desktop-extensions)（DXT），就能分别在 Claude Code 或 Claude 桌面应用中连接并测试这些工具。

To connect your local MCP server to Claude Code, run `claude mcp add <name> <command> [args...]`.

要将本地MCP服务器连接到Claude Code，请运行命令：`claude mcp add <名称> <命令> [参数...]`。

To connect your local MCP server or DXT to the Claude Desktop app, navigate to `Settings > Developer` or `Settings > Extensions`, respectively.

要将本地MCP服务器或DXT连接到Claude桌面应用，请分别导航至`设置 > 开发者`或`设置 > 扩展`。

Tools can also be passed directly into [Anthropic API](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) calls for programmatic testing.

工具也可以直接传入 [Anthropic API](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) 调用，以便进行程序化测试。

Test the tools yourself to identify any rough edges. Collect feedback from your users to build an intuition around the use-cases and prompts you expect your tools to enable.

请亲自测试工具，找出不够顺手的地方；同时收集用户反馈，逐步理解这些工具应该支持哪些使用场景和提示词。

### Running an evaluation

### 运行评估

Next, you need to measure how well Claude uses your tools by running an evaluation. Start by generating lots of evaluation tasks, grounded in real world uses. We recommend collaborating with an agent to help analyze your results and determine how to improve your tools. See this process end-to-end in our [tool evaluation cookbook](https://platform.claude.com/cookbook/tool-evaluation-tool-evaluation).

接下来，你需要通过评估来衡量 Claude 使用工具的效果。首先生成大量源于真实场景的评估任务。我们建议让 Agent 协助分析结果并判断如何改进工具。完整流程请参阅[工具评估实践手册](https://platform.claude.com/cookbook/tool-evaluation-tool-evaluation)。

![This graph measures the test set accuracy of human-written vs. Claude-optimized Slack MCP servers.](https://www-cdn.anthropic.com/images/4zrzovbb/website/6e810aee67f3f3c955832fb7bf9033ffb0102000-1920x1080.png)


Held-out test set performance of our internal Slack tools

我们内部 Slack 工具在保留测试集上的表现

**Generating evaluation tasks**

**生成评估任务**

With your early prototype, Claude Code can quickly explore your tools and create dozens of prompt and response pairs. Prompts should be inspired by real-world uses and be based on realistic data sources and services (for example, internal knowledge bases and microservices). We recommend you avoid overly simplistic or superficial “sandbox” environments that don’t stress-test your tools with sufficient complexity. Strong evaluation tasks might require multiple tool calls—potentially dozens.

有了早期原型，Claude Code 可以快速探索工具并创建数十组提示与响应。提示应源于真实使用场景，并基于现实的数据源和服务，例如内部知识库与微服务。应避免使用过于简单、流于表面的“沙盒”环境，因为它们没有足够的复杂度来对工具进行压力测试。高质量评估任务可能需要多次工具调用，甚至多达数十次。

Here are some examples of strong tasks:
- Schedule a meeting with Jane next week to discuss our latest Acme Corp project. Attach the notes from our last project planning meeting and reserve a conference room.
- Customer ID 9182 reported that they were charged three times for a single purchase attempt. Find all relevant log entries and determine if any other customers were affected by the same issue.
- Customer Sarah Chen just submitted a cancellation request. Prepare a retention offer. Determine: (1) why they're leaving, (2) what retention offer would be most compelling, and (3) any risk factors we should be aware of before making an offer.

优质任务示例：
- 安排下周与 Jane 开会，讨论我们最新的 Acme Corp 项目；附上上次项目规划会议的记录，并预订一间会议室。
- 客户 ID 9182 反馈一次购买尝试被扣款三次。查找所有相关日志，并判断是否还有其他客户受到同一问题影响。
- 客户 Sarah Chen 刚提交取消服务请求。请准备一份挽留方案，并确定：（1）她为什么离开；（2）哪种挽留方案最有吸引力；（3）提出方案前需要注意哪些风险因素。

And here are some weaker tasks:
- Schedule a meeting with jane@acme.corp next week.
- Search the payment logs for `purchase_complete` and `customer_id=9182`.
- Find the cancellation request by Customer ID 45892.

较弱的任务示例：
- 安排下周与 `jane@acme.corp` 开会。
- 在支付日志中搜索 `purchase_complete` 和 `customer_id=9182`。
- 查找客户 ID 45892 的取消请求。

Each evaluation prompt should be paired with a verifiable response or outcome. Your verifier can be as simple as an exact string comparison between ground truth and sampled responses, or as advanced as enlisting Claude to judge the response. Avoid overly strict verifiers that reject correct responses due to spurious differences like formatting, punctuation, or valid alternative phrasings.

每个评估提示都应对应一个可验证的响应或结果。验证器既可以只是将标准答案与采样响应进行精确字符串比较，也可以复杂到让 Claude 判断响应是否正确。不要让验证器过于严格，以免仅因格式、标点或合理的替代表述不同而拒绝正确答案。

For each prompt-response pair, you can optionally also specify the tools you expect an agent to call in solving the task, to measure whether or not agents are successful in grasping each tool’s purpose during evaluation. However, because there might be multiple valid paths to solving tasks correctly, try to avoid overspecifying or overfitting to strategies.

对于每组提示—响应，你也可以选择指定预期 Agent 调用的工具，用来衡量它在评估中是否理解了各工具的用途。但由于正确完成任务可能存在多条有效路径，应避免过度规定或让评估过拟合某一种策略。

**Running the evaluation**

**运行评估**

We recommend running your evaluation programmatically with direct LLM API calls. Use simple agentic loops (`while`-loops wrapping alternating LLM API and tool calls): one loop for each evaluation task. Each evaluation agent should be given a single task prompt and your tools.

我们建议直接调用 LLM API，以编程方式运行评估。每项任务使用一个简单的 Agent 循环，即用 `while` 循环交替执行 LLM API 调用和工具调用。每个评估 Agent 只接收一项任务及待评估的工具。

In your evaluation agents’ system prompts, we recommend instructing agents to output not just structured response blocks (for verification), but also reasoning and feedback blocks. Instructing agents to output these *before* tool call and response blocks may increase LLMs’ effective intelligence by triggering chain-of-thought (CoT) behaviors.

在评估 Agent 的系统提示词中，我们建议要求它们不仅输出用于验证的结构化响应块，还输出推理和反馈块。让 Agent 在工具调用和响应块*之前*输出这些内容，可能通过触发思维链（CoT）行为提升大语言模型的有效智能。

If you’re running your evaluation with Claude, you can turn on [interleaved thinking](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking#interleaved-thinking) for similar functionality “off-the-shelf”. This will help you probe why agents do or don’t call certain tools and highlight specific areas of improvement in tool descriptions and specs.

如果使用 Claude 运行评估，可以开启[交错思考](https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking#interleaved-thinking)，直接获得类似能力。这有助于分析 Agent 为什么调用或不调用某个工具，并定位工具描述与规格中需要改进的部分。

As well as top-level accuracy, we recommend collecting other metrics like the total runtime of individual tool calls and tasks, the total number of tool calls, the total token consumption, and tool errors. Tracking tool calls can help reveal common workflows that agents pursue and offer some opportunities for tools to consolidate.

除了总体准确率，我们还建议收集单次工具调用和完整任务的总耗时、工具调用总次数、Token 总消耗量以及工具错误等指标。跟踪工具调用能够揭示 Agent 常用的工作流，也可能暴露适合合并的工具。

![This graph measures the test set accuracy of human-written vs. Claude-optimized Asana MCP servers.](https://www-cdn.anthropic.com/images/4zrzovbb/website/3f1f47e80974750cd924bc51e42b6df1ad997fab-1920x1080.png)


Held-out test set performance of our internal Asana tools

我们内部 Asana 工具在保留测试集上的表现

**Analyzing results**

**分析结果**

Agents are your helpful partners in spotting issues and providing feedback on everything from contradictory tool descriptions to inefficient tool implementations and confusing tool schemas. However, keep in mind that what agents omit in their feedback and responses can often be more important than what they include. LLMs don’t always [say what they mean](https://www.anthropic.com/research/tracing-thoughts-language-model).

Agent 是发现问题和提供反馈的得力伙伴，能指出工具描述相互矛盾、实现低效或 schema 难以理解等问题。但要注意，Agent 在反馈和响应中*没有提到*的内容往往比它明确说出的内容更重要。大语言模型并不总能[准确表达其真实思维过程](https://www.anthropic.com/research/tracing-thoughts-language-model)。

Observe where your agents get stumped or confused. Read through your evaluation agents’ reasoning and feedback (or CoT) to identify rough edges. Review the raw transcripts (including tool calls and tool responses) to catch any behavior not explicitly described in the agent’s CoT. Read between the lines; remember that your evaluation agents don’t necessarily know the correct answers and strategies.

观察 Agent 在哪里卡住或感到困惑。阅读评估 Agent 的推理与反馈（或思维链），找出不够顺手的地方；再检查包含工具调用和响应在内的原始记录，捕捉思维链中没有明确说明的行为。要从字里行间寻找线索，并记住评估 Agent 未必知道正确答案和正确策略。

Analyze your tool calling metrics. Lots of redundant tool calls might suggest some rightsizing of pagination or token limit parameters is warranted; lots of tool errors for invalid parameters might suggest tools could use clearer descriptions or better examples. When we launched Claude’s [web search tool](https://www.anthropic.com/news/web-search), we identified that Claude was needlessly appending `2025` to the tool’s `query` parameter, biasing search results and degrading performance (we steered Claude in the right direction by improving the tool description).

分析工具调用指标。大量重复调用可能意味着分页大小或 Token 上限需要调整；大量由无效参数引发的错误，则可能说明工具需要更清晰的描述或更好的示例。推出 Claude 的[网页搜索工具](https://www.anthropic.com/news/web-search)时，我们发现 Claude 会无谓地在 `query` 参数中追加 `2025`，使搜索结果产生偏差并降低性能；后来通过改进工具描述，将 Claude 引导回了正确方向。

### Collaborating with agents

### 与 Agent 协作

You can even let agents analyze your results and improve your tools for you. Simply concatenate the transcripts from your evaluation agents and paste them into Claude Code. Claude is an expert at analyzing transcripts and refactoring lots of tools all at once—for example, to ensure tool implementations and descriptions remain self-consistent when new changes are made.

你甚至可以让 Agent 分析评估结果并代为改进工具。只需将各评估 Agent 的记录拼接起来，交给 Claude Code。Claude 擅长分析调用记录并一次重构大量工具，例如在发生改动时，确保工具实现与描述继续保持一致。

In fact, most of the advice in this post came from repeatedly optimizing our internal tool implementations with Claude Code. Our evaluations were created on top of our internal workspace, mirroring the complexity of our internal workflows, including real projects, documents, and messages.

实际上，本文多数建议均源于我们使用Claude Code反复优化内部工具实践。我们的评估基于内部工作区构建，完整复现了包含真实项目、文档和消息的复杂工作流。

We relied on held-out test sets to ensure we did not overfit to our “training” evaluations. These test sets revealed that we could extract additional performance improvements even beyond what we achieved with "expert" tool implementations—whether those tools were manually written by our researchers or generated by Claude itself.

我们依赖保留测试集避免对"训练"评估过度拟合。这些测试集揭示出：即使通过"专家级"工具实现（无论由研究人员手动编写还是Claude生成），我们仍能挖掘更多性能提升空间。

In the next section, we’ll share some of what we learned from this process.

下一节将分享我们在此过程中的部分收获。

## Principles for writing effective tools

## 编写高效工具的原则

In this section, we distill our learnings into a few guiding principles for writing effective tools.

在本节中，我们将经验提炼为几项指导原则，用于编写有效的工具。

### Choosing the right tools for agents

### 为 Agent 选择合适的工具

More tools don’t always lead to better outcomes. A common error we’ve observed is tools that merely wrap existing software functionality or API endpoints—whether or not the tools are appropriate for agents. This is because agents have distinct “affordances” to traditional software—that is, they have different ways of perceiving the potential actions they can take with those tools

工具越多，并不一定带来更好的结果。我们观察到一种常见错误：不管是否适合 Agent，开发者只是将现有软件功能或 API 端点逐个包装成工具。原因在于，Agent 与传统软件具有不同的“可供性”，也就是它们感知这些工具能够执行哪些操作的方式不同。

LLM agents have limited "context" (that is, there are limits to how much information they can process at once), whereas computer memory is cheap and abundant. Consider the task of searching for a contact in an address book. Traditional software programs can efficiently store and process a list of contacts one at a time, checking each one before moving on.

LLM Agent 的“上下文”有限，也就是它一次能处理的信息量存在上限；计算机内存则廉价而充足。以在通讯录中查找联系人为例，传统程序可以高效存储整份联系人列表，再逐条检查记录。

However, if an LLM agent uses a tool that returns ALL contacts and then has to read through each one token-by-token, it's wasting its limited context space on irrelevant information (imagine searching for a contact in your address book by reading each page from top-to-bottom—that is, via brute-force search). The better and more natural approach (for agents and humans alike) is to skip to the relevant page first (perhaps finding it alphabetically).

但如果 LLM Agent 使用一个返回全部联系人的工具，再逐 Token 阅读每条记录，就会把有限的上下文浪费在无关信息上。这就像为了找一个联系人，从通讯录第一页开始逐页通读，也就是暴力搜索。对 Agent 和人类而言，更自然的方式都是先跳到相关页面，例如按字母顺序定位。

We recommend building a few thoughtful tools targeting specific high-impact workflows, which match your evaluation tasks and scaling up from there. In the address book case, you might choose to implement a `search_contacts` or `message_contact` tool instead of a `list_contacts` tool.

我们建议构建少量经过深思熟虑、针对特定高影响力工作流的工具，使其与评估任务相匹配，并以此为基础逐步扩展。在通讯录案例中，你可以选择实现`search_contacts`或`message_contact`工具，而非`list_contacts`工具。

Tools can consolidate functionality, handling potentially *multiple* discrete operations (or API calls) under the hood. For example, tools can enrich tool responses with related metadata or handle frequently chained, multi-step tasks in a single tool call.

工具可以整合功能，在内部完成*多个*离散操作或 API 调用。例如，工具可以在响应中补充相关元数据，也可以用一次调用完成经常连续执行的多步任务。

Here are some examples:
- Instead of implementing a `list_users`, `list_events`, and `create_event` tools, consider implementing a `schedule_event` tool which finds availability and schedules an event.
- Instead of implementing a `read_logs` tool, consider implementing a `search_logs` tool which only returns relevant log lines and some surrounding context.
- Instead of implementing `get_customer_by_id`, `list_transactions`, and `list_notes` tools, implement a `get_customer_context` tool which compiles all of a customer’s recent & relevant information all at once.

以下是一些示例：
- 不要分别实现`list_users`、`list_events`和`create_event`工具，可以考虑实现一个`schedule_event`工具，用于查找空闲时间并安排事件。
- 不要实现`read_logs`工具，可以考虑实现一个`search_logs`工具，仅返回相关日志行及部分上下文。
- 不要分别实现`get_customer_by_id`、`list_transactions`和`list_notes`工具，可以实现一个`get_customer_context`工具，一次性汇编客户所有近期相关和重要信息。

Make sure each tool you build has a clear, distinct purpose. Tools should enable agents to subdivide and solve tasks in much the same way that a human would, given access to the same underlying resources, and simultaneously reduce the context that would have otherwise been consumed by intermediate outputs.

确保每个工具都有清晰且独立的用途。工具应帮助 Agent 像拥有相同底层资源的人类一样拆分并解决任务，同时减少原本会被中间结果占用的上下文。

Too many tools or overlapping tools can also distract agents from pursuing efficient strategies. Careful, selective planning of the tools you build (or don’t build) can really pay off.

工具过多或功能重叠，也会干扰 Agent 采用高效策略。审慎选择要构建和不构建的工具，往往能带来显著回报。

### Namespacing your tools

### 为工具设置命名空间

Your AI agents will potentially gain access to dozens of MCP servers and hundreds of different tools–including those by other developers. When tools overlap in function or have a vague purpose, agents can get confused about which ones to use.

你的 AI Agent 可能会接入数十个 MCP 服务器和数百种工具，其中还包括其他开发者提供的工具。当工具功能重叠或用途模糊时，Agent 可能不知道应该选择哪一个。

Namespacing (grouping related tools under common prefixes) can help delineate boundaries between lots of tools; MCP clients sometimes do this by default. For example, namespacing tools by service (e.g., `asana_search`, `jira_search`) and by resource (e.g., `asana_projects_search`, `asana_users_search`), can help agents select the right tools at the right time.

命名空间，也就是用共同前缀组织相关工具，可以帮助划分大量工具之间的边界；MCP 客户端有时会默认这样处理。例如，可以按服务划分为 `asana_search`、`jira_search`，也可以进一步按资源划分为 `asana_projects_search`、`asana_users_search`，帮助 Agent 在合适的时机选择正确工具。

We have found selecting between prefix- and suffix-based namespacing to have non-trivial effects on our tool-use evaluations. Effects vary by LLM and we encourage you to choose a naming scheme according to your own evaluations.

我们发现，选择前缀式还是后缀式命名空间，会对工具使用评估产生不可忽视的影响。不同 LLM 上的效果并不相同，因此应依据自己的评估结果选择命名方案。

Agents might call the wrong tools, call the right tools with the wrong parameters, call too few tools, or process tool responses incorrectly. By selectively implementing tools whose names reflect natural subdivisions of tasks, you simultaneously reduce the number of tools and tool descriptions loaded into the agent’s context and offload agentic computation from the agent’s context back into the tool calls themselves. This reduces an agent’s overall risk of making mistakes.

Agent 可能选错工具、给正确工具传入错误参数、调用次数不足，或错误处理工具响应。选择性地实现名称能够反映任务自然分工的工具，可以同时减少 Agent 上下文中加载的工具数量和描述，并把一部分原本由 Agent 在上下文中完成的计算转移到工具内部，从而降低整体出错风险。

### Returning meaningful context from your tools

### 从工具返回有意义的上下文

In the same vein, tool implementations should take care to return only high signal information back to agents. They should prioritize contextual relevance over flexibility, and eschew low-level technical identifiers (for example: `uuid`, `256px_image_url`, `mime_type`). Fields like `name`, `image_url`, and `file_type` are much more likely to directly inform agents’ downstream actions and responses.

同理，工具实现应只向 Agent 返回高信号信息。相比追求通用灵活，更应优先保证信息与当前情境相关，并避免暴露 `uuid`、`256px_image_url`、`mime_type` 等底层技术字段。`name`、`image_url`、`file_type` 这类字段更可能直接支持 Agent 的后续行动和回答。

Agents also tend to grapple with natural language names, terms, or identifiers significantly more successfully than they do with cryptic identifiers. We’ve found that merely resolving arbitrary alphanumeric UUIDs to more semantically meaningful and interpretable language (or even a 0-indexed ID scheme) significantly improves Claude’s precision in retrieval tasks by reducing hallucinations.

相比晦涩标识符，Agent 通常能更准确地处理自然语言名称、术语和标识。我们发现，只要把任意字母数字 UUID 转换为语义更明确、更容易解释的文字，甚至改成从 0 开始的索引，就能减少幻觉，并显著提高 Claude 在检索任务中的准确率。

In some instances, agents may require the flexibility to interact with both natural language and technical identifiers outputs, if only to trigger downstream tool calls (for example, `search_user(name=’jane’)` → `send_message(id=12345)`). You can enable both by exposing a simple `response_format` enum parameter in your tool, allowing your agent to control whether tools return `“concise”` or `“detailed”` responses (images below).

在某些场景中，Agent 既要使用自然语言，也要使用技术标识符，哪怕后者只是为了触发后续工具调用，例如 `search_user(name='jane')` → `send_message(id=12345)`。可以为工具提供简单的 `response_format` 枚举参数，让 Agent 选择返回“简洁”还是“详细”响应，从而兼顾两种需求。

You can add more formats for even greater flexibility, similar to GraphQL where you can choose exactly which pieces of information you want to receive. Here is an example ResponseFormat enum to control tool response verbosity:

还可以增加更多格式以提高灵活性，类似 GraphQL 允许调用方精确选择所需字段。下面是用于控制工具响应详细程度的 `ResponseFormat` 枚举示例：

```text
enum ResponseFormat {
   DETAILED = "detailed",
   CONCISE = "concise"
}
```



Here’s an example of a detailed tool response (206 tokens):

以下是详细工具响应示例（206个token）：

![This code snippet depicts an example of a detailed tool response.](https://www-cdn.anthropic.com/images/4zrzovbb/website/5ed0d30526bf68624f335d075b8c1541be3bb595-1920x1006.png)


Here’s an example of a concise tool response (72 tokens):

以下是简洁工具响应示例（72个token）：

![This code snippet depicts a concise tool response.](https://www-cdn.anthropic.com/images/4zrzovbb/website/d4f649a66482efb5a80cf14ea85e84974ede1c49-1920x725.png)


Slack threads and thread replies are identified by unique `thread_ts` which are required to fetch thread replies. `thread_ts` and other IDs (`channel_id`, `user_id`) can be retrieved from a `“detailed”` tool response to enable further tool calls that require these. `“concise”` tool responses return only thread content and exclude IDs. In this example, we use ~⅓ of the tokens with `“concise”` tool responses.

Slack 主题及其回复由唯一的 `thread_ts` 标识；获取主题回复时必须提供它。`thread_ts` 以及 `channel_id`、`user_id` 等其他 ID，可以从“详细”响应中取得，以便继续执行需要这些标识符的工具调用。“简洁”响应则只返回主题内容，不包含 ID。在这个例子中，“简洁”响应的 Token 用量约为“详细”响应的三分之一。

Even your tool response structure—for example XML, JSON, or Markdown—can have an impact on evaluation performance: there is no one-size-fits-all solution. This is because LLMs are trained on next-token prediction and tend to perform better with formats that match their training data. The optimal response structure will vary widely by task and agent. We encourage you to select the best response structure based on your own evaluation.

甚至 XML、JSON 或 Markdown 等工具响应结构也会影响评估表现，不存在适用于所有场景的方案。这是因为 LLM 通过预测下一个 Token 进行训练，往往更擅长处理与训练数据相似的格式。最佳响应结构会随任务和 Agent 而显著变化，应根据自己的评估选择。

### Optimizing tool responses for token efficiency

### 优化工具响应的 Token 效率

Optimizing the quality of context is important. But so is optimizing the *quantity* of context returned back to agents in tool responses.

优化上下文的质量很重要，但控制工具响应返回给 Agent 的上下文*数量*同样重要。

We suggest implementing some combination of pagination, range selection, filtering, and/or truncation with sensible default parameter values for any tool responses that could use up lots of context. For Claude Code, we restrict tool responses to 25,000 tokens by default. We expect the effective context length of agents to grow over time, but the need for context-efficient tools to remain.

对于可能大量占用上下文的工具响应，我们建议组合使用分页、范围选择、过滤和截断，并设置合理的默认参数。Claude Code 默认将工具响应限制在 25,000 Token。我们预计 Agent 的有效上下文长度会继续增长，但对上下文高效工具的需求不会消失。

If you choose to truncate responses, be sure to steer agents with helpful instructions. You can directly encourage agents to pursue more token-efficient strategies, like making many small and targeted searches instead of a single, broad search for a knowledge retrieval task. Similarly, if a tool call raises an error (for example, during input validation), you can prompt-engineer your error responses to clearly communicate specific and actionable improvements, rather than opaque error codes or tracebacks.

如果决定截断响应，务必用有帮助的说明引导 Agent。比如在知识检索任务中，可明确鼓励它执行多次小范围、定向搜索，而不是一次宽泛搜索。类似地，如果工具调用因输入校验等原因报错，可以通过提示工程让错误响应给出具体、可执行的修正建议，而不是只返回晦涩的错误码或堆栈信息。

Here’s an example of a truncated tool response:

这里展示了一个被截断的工具响应示例：

![This image depicts an example of a truncated tool response.](https://www-cdn.anthropic.com/images/4zrzovbb/website/e440d6a69d0ca80e71f3bec5c2d00906ff03ce6d-1920x1162.png)


Here’s an example of an unhelpful error response:

这里展示了一个无帮助的错误响应示例：

![This image depicts an example of an unhelpful tool response. ](https://www-cdn.anthropic.com/images/4zrzovbb/website/2445187904704fec8c50af0b950e310ba743fac2-1920x733.png)


Here’s an example of a helpful error response:

这里展示了一个有帮助的错误响应示例：

![This image depicts an example of a helpful error response.](https://www-cdn.anthropic.com/images/4zrzovbb/website/810661bd44a35fb273806ae95160040155978c3e-1920x850.png)


Tool truncation and error responses can steer agents towards more token-efficient tool-use behaviors (using filters or pagination) or give examples of correctly formatted tool inputs.

工具的截断提示和错误响应可以引导 Agent 使用过滤或分页等更节省 Token 的策略，也可以给出格式正确的工具输入示例。

### Prompt-engineering your tool descriptions

### 通过提示工程优化工具描述

We now come to one of the most effective methods for improving tools: prompt-engineering your tool descriptions and specs. Because these are loaded into your agents’ context, they can collectively steer agents toward effective tool-calling behaviors.

下面介绍一种最有效的工具改进方法：对工具描述和规格进行提示工程。由于这些内容会被加载进 Agent 的上下文，它们会共同引导 Agent 形成更有效的工具调用行为。

When writing tool descriptions and specs, think of how you would describe your tool to a new hire on your team. Consider the context that you might implicitly bring—specialized query formats, definitions of niche terminology, relationships between underlying resources—and make it explicit. Avoid ambiguity by clearly describing (and enforcing with strict data models) expected inputs and outputs. In particular, input parameters should be unambiguously named: instead of a parameter named `user`, try a parameter named `user_id`.

在撰写工具描述和规格时，请想象你会如何向团队的新成员介绍你的工具。考虑你可能隐含带入的上下文——特殊的查询格式、小众术语的定义、底层资源之间的关系——并将它们明确化。通过清晰地描述（并通过严格的数据模型来强制执行）预期的输入和输出，来避免歧义。尤其要确保输入参数的命名明确无误：与其使用名为 `user` 的参数，不如尝试使用名为 `user_id` 的参数。

With your evaluation you can measure the impact of your prompt engineering with greater confidence. Even small refinements to tool descriptions can yield dramatic improvements. Claude Sonnet 3.5 achieved state-of-the-art performance on the [SWE-bench Verified](https://www.anthropic.com/engineering/swe-bench-sonnet) evaluation after we made precise refinements to tool descriptions, dramatically reducing error rates and improving task completion.

借助评估，你可以更有把握地衡量提示工程的影响。即使只是细微调整工具描述，也可能带来显著提升。在我们精准优化工具描述后，Claude Sonnet 3.5 在 [SWE-bench Verified](https://www.anthropic.com/engineering/swe-bench-sonnet) 评估中取得了当时最先进的成绩，大幅降低错误率并提高任务完成率。

You can find other best practices for tool definitions in our [Developer Guide](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use#best-practices-for-tool-definitions). If you’re building tools for Claude, we also recommend reading about how tools are dynamically loaded into Claude’s [system prompt](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use#tool-use-system-prompt). Lastly, if you’re writing tools for an MCP server, [tool annotations](https://modelcontextprotocol.io/specification/2025-06-18/server/tools) help disclose which tools require open-world access or make destructive changes.

你可以在[开发者指南](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use#best-practices-for-tool-definitions)中找到更多工具定义的最佳实践。如果正在为 Claude 构建工具，我们还建议了解工具如何动态加载到 Claude 的[系统提示](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/implement-tool-use#tool-use-system-prompt)中。最后，如果正在为 MCP 服务器编写工具，[工具注解](https://modelcontextprotocol.io/specification/2025-06-18/server/tools)可以声明哪些工具需要访问开放世界，或会执行破坏性操作。

## Looking ahead

## 展望未来

To build effective tools for agents, we need to re-orient our software development practices from predictable, deterministic patterns to non-deterministic ones.

要为 Agent 构建有效工具，我们需要调整软件开发实践：从面向可预测的确定性模式，转向面向非确定性模式。

Through the iterative, evaluation-driven process we’ve described in this post, we've identified consistent patterns in what makes tools successful: Effective tools are intentionally and clearly defined, use agent context judiciously, can be combined together in diverse workflows, and enable agents to intuitively solve real-world tasks.

通过本文介绍的迭代式、评估驱动流程，我们归纳出了有效工具的一些共性：定义经过审慎设计且足够清晰；节制地使用 Agent 上下文；能够组合成多种工作流；并让 Agent 直观地解决现实任务。

In the future, we expect the specific mechanisms through which agents interact with the world to evolve—from updates to the MCP protocol to upgrades to the underlying LLMs themselves. With a systematic, evaluation-driven approach to improving tools for agents, we can ensure that as agents become more capable, the tools they use will evolve alongside them.

未来，Agent 与世界交互的具体机制会继续演进，包括 MCP 协议更新和底层 LLM 升级。只要采用系统化、评估驱动的方法改进 Agent 工具，就能让工具随着 Agent 能力增强而同步演进。

## Acknowledgements

## 致谢

Written by Ken Aizawa with valuable contributions from colleagues across Research (Barry Zhang, Zachary Witten, Daniel Jiang, Sami Al-Sheikh, Matt Bell, Maggie Vo), MCP (Theodora Chu, John Welsh, David Soria Parra, Adam Jones), Product Engineering (Santiago Seira), Marketing (Molly Vorwerck), Design (Drew Roper), and Applied AI (Christian Ryan, Alexander Bricken).

本文由 Ken Aizawa 撰写，并得到研究团队（Barry Zhang、Zachary Witten、Daniel Jiang、Sami Al-Sheikh、Matt Bell、Maggie Vo）、MCP 团队（Theodora Chu、John Welsh、David Soria Parra、Adam Jones）、产品工程团队（Santiago Seira）、市场团队（Molly Vorwerck）、设计团队（Drew Roper）和应用 AI 团队（Christian Ryan、Alexander Bricken）多位同事的宝贵贡献。

[^1]: 这里讨论的是不包括底层大语言模型训练在内的系统改进方法。
