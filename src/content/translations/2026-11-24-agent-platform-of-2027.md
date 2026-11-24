---
title: "2027 年的 Agent 平台蓝图(Agent platform of 2027)"
date: 2026-11-24
tags: [翻译, agent, agent-platform, agent-harness, multi-agent, software-architecture]
summary: "John Suh 勾勒了 2027 年 Agent 平台的完整架构蓝图：用“花园底座”取代“工厂流水线”，从 Actor 运行时隔离、N:M 算力调度、共享 RBAC POSIX 文件系统，到会话与对话解耦、审批收件箱、动态事件监听与可定制 App 层，解释为什么未来的应用软件会收敛为一个 Agentic 操作系统。"
original: "https://x.com/john_ssuh/status/2124336124172935336"
---

## 精选点评

### 1. 把“Agent 平台”从工作流工具重新定义为应用层操作系统

这篇文章最锋利的判断，是把目前割裂的几条产品线——编码 Agent 客户端（ADE）、拖拽式工作流（n8n / Zapier）、生成式 UI（Artifacts / Apps）、企业 SaaS——全部放进同一张架构图里。作者认为，未来的应用层不会继续按垂直行业切成无数孤立 SaaS，而是收敛为一个“Agentic OS（智能体操作系统）”，原有软件退化为它底层的数据源。比起“工厂的工厂”，他提出的“花园底座”隐喻更准确：平台提供土壤与边界，客户种下自己的“种子”，由 Agent、人类和业务信号共同演化出专属的应用与流程。

### 2. “Session 与 Conversation 解耦”和“Inbox”切中了人机交互的真正痛点

当前大多数 coding agent 产品把底层执行轨迹（工具调用、思考过程、中间产物）直接暴露在聊天框里，随着并行 Agent 数量上升，人类的注意力很快会被淹没。文章提出的分层非常克制且务实：**Conversation** 是面向用户的沟通抽象（类似 Slack 频道或邮件线程），**Session** 退居为类似源码的调试与审计界面，而日常高频交互则收敛到面向审批与决策的 **Inbox（收件箱）**。这与“人类是并发 Agent 系统中的串行判断瓶颈”的工程共识高度一致。

### 3. 技术架构押注了几个值得持续跟踪的关键拐点

作者在底层给出了非常具体的工程方向：用 **Actor 模型**替代单一的 Temporal 式工作流以支持自进化 Harness 的运行时隔离；把计算环境抽象为 **N 个 Agent 对 M 台机器**；用带独立 **RBAC** 的云端共享 **POSIX 文件系统**统一承载代码、扩展、文件和版本控制；用可即时编写的 **Listeners / Monitors** 取代僵化的定时 cron 任务；用代码定义的持久化工作流取代拖拽节点。这些组件各自已有早期原型（如 Cloudflare DO、JuiceFS、Claude Code Monitor 等），真正的壁垒在于能否把它们整合成一致的多租户体验。

### 4. 值得保留审慎的地方

这篇蓝图刻意站在“终局”视角推演，对现实落地中的几大硬约束着墨不多：第一，当 Agent 可以即时编写自己的扩展、监听器和界面 App 时，**安全边界与提示词注入（Prompt Injection）**的攻击面会成倍放大，单靠 RBAC 文件系统能否兜住仍有待验证；第二，作者断言多数 2025–2026 年的 ADE 和垂直 SaaS 会死于创新者窘境，但企业软件的迁移惯性、合规审计与责任归属往往比技术演进慢得多；第三，“独立第三方公司能否在 ChatGPT 与 Claude 的应用层扩张下拿下这一层”，作者只说“有理由相信”，并未展开论证。

## 全文总结

本文是 John Suh（`@john_ssuh`）在 X 上发布的“2027 年 Agent 平台（Agent platform of 2027）”架构蓝图（由原帖正文与四张长文配图组成）。作者认为，未来应用层软件的终局是一个统一的 Agentic 操作系统：所有其他软件都将退化为这一层的数据库，支撑百万级 Agent 集群（swarm）在其上运行。相比“工厂的工厂”，获胜的平台更像一片“花园的底座”——客户在上面种下自己的“种子”，由 Agent、人类以及业务传感器传来的信号共同培育、演化出各自专属的应用与流程。

围绕这一愿景，作者从底层运行时到上层交互界面，系统拆解了八个核心模块：

1. **作为 Actor 的 Agent（Agents as actors）**：从 Temporal 等集中式工作流引擎转向 Actor 模型，为每个 Agent Harness 提供独立的运行时隔离，以支持自进化（即时编写自身扩展与 hook）；同时将 Agent 定义与实例、会话分离，支持“全能巨型 Agent”与“按需定制 Agent”并存。
2. **环境与计算设备（Environments and computers）**：同时支持多云检查点沙盒克隆与用户本地电脑，实现 N 个 Agent 对 M 台电脑的灵活编排，并允许环境由 Agent 自主配置。
3. **带 RBAC 的共享文件系统（RBAC-ed filesystem）**：在云端提供与计算节点解耦、自带基于角色访问控制（RBAC）的共享 POSIX 文件系统，同时扮演 GitHub（存放代码、扩展与定义）与 Google Drive（存放文件与 App）的角色，并支持 `.env` 托管与 `.git`/`jj` 版本控制。
4. **会话与对话分离（Separation of session and conversation）**：不再将底层 Agent Session 和中间工具调用直接暴露给用户，而是抽象出类似 Slack 频道或邮件线程的“Conversation”作为主交互层，底层 Session 仅用于检查与调试。
5. **收件箱（Inbox）**：人类日常交互将从通读对话转向聚焦审批与提问的收件箱，并支持嵌入面向具体业务的定制化审核 App。
6. **监听器、监控器与单租户数据（Listeners, monitors, single-tenant data）**：超越每小时一次的通用 cron 触发或硬编码 Webhook 插件，让 Agent 能按租户即时构建对外部事件流（WSS、Kafka、CDC 等）的监听与过滤机制，将外部变化转化为可行动的信号。
7. **工作流（Workflows）**：针对跨长周期、混合智能体与确定性步骤的企业流程，放弃脆弱的拖拽式自动化（如 n8n、早期 Zapier），转而在集中了 API 与 MCP 数据流的 Agent 平台上用代码定义持久化工作流。
8. **应用层（Apps）**：将 Replit、Claude Artifacts、ChatGPT Apps 等形态统一为文件系统中的“App”概念。平台本身成为承载这些可定制应用的操作系统——用户可以直接让 Agent 按需修改最细粒度的界面，而非依赖垂直 SaaS 厂商的实施顾问。同时，App 也将以多种容器形态共存（类 Tmux 界面、消息内嵌、应用为主聊天为辅、无限画布、分层窗口、可调面板）。

## 要点总结

- **终局判断**：应用层软件将收敛为统一的 Agentic 操作系统，其他软件退化为底层数据库；获胜平台更像“花园底座”而非“工厂的工厂”。
- **运行时演进**：从 Temporal 式调度转向 Actor 模型，提供运行时隔离，支撑可即时自写扩展/hook 的自进化 Harness；且即便是倡导单一巨型 Agent 的厂商（如 Anthropic 在形式化费马大定理实验中的做法），其实际显示偏好也更接近按代码定义、收敛工具权限的“Grokbot”模式。
- **算力抽象**：支持多厂商检查点沙盒克隆 + 本地电脑，实现 **N Agents × M Computers** 的任意映射，且环境可由 Agent 自主配置。
- **状态与权限层**：云端共享 POSIX 文件系统与计算环境分离，自带灵活 RBAC（类人权限、按当前轮次发起者授权或混合模式），兼具代码仓库、网盘与版本控制（`.git` / `jj`）能力。
- **交互分层**：将面向用户的 **Conversation** 与面向调试的 **Session** 解耦，避免把原始工具调用流直接推给用户；预测 2025–2026 年直接包裹编码 Session 的多数 ADE（如 T3）将陷入类似 Cursor 的创新者窘境。
- **人工介入形态**：以审批和提问为核心的 **Inbox** 将成为主要入口，并内嵌租户专属的中间产物审阅 App。
- **事件驱动超集**：允许 Agent 按租户动态编写事件监听器与监控器（接入 WSS、Kafka、CDC 等），作为现有定时 cron 与插件 Webhook 的严格超集。
- **代码化工作流**：在统一管理 API 与 MCP 的平台上，用代码定义长周期持久化工作流，淘汰粗陋的拖拽式编排工具。
- **应用即文件系统中的可定制代码**：所有界面（包括 `/conversations` 本身）都是文件系统里可克隆、可修改的 App/Artifact；垂直 SaaS 的传统逻辑将被“由 Agent 按指令直接定制界面”瓦解，并衍生出 Tmux、消息内嵌、侧边栏聊天、无限画布（tldraw）、分层窗口与可调面板等多种容器形态。

---

## 内容原文(沉浸式翻译)

### X 原帖正文

Agent platform of 2027.

2027 年的 Agent 平台。

This is the end game. This is the blueprint for the one and only application layer software that will exist. Every other software will effectively become databases for this layer, the everything agentic operating system for the million agent swarm to work on top of.

这就是终局。这是未来唯一会存在的应用层软件的蓝图。其他所有软件实际上都将沦为这一层的数据库——而这一层，正是供百万级 Agent 集群（swarm）在其上运行的全能智能体操作系统（agentic operating system）。

This is obviously the end game vision for the application layer of ChatGPT and Claude. I have reasons to believe that an independent company will own this product layer. But most ADE, "enterprise agent platform", or vertical saas companies, are focused on the wrong things far too narrowly, not technically competent, and do not have the product / technical vision to see this inevitable future.

这显然也是 ChatGPT 和 Claude 在应用层的终局愿景。我有理由相信，最终掌控这一产品层的会是一家独立公司。但目前绝大多数 ADE（Agent 开发环境）、“企业级 Agent 平台”或垂直 SaaS 公司，关注的焦点都过于狭隘且跑偏了，技术能力也不足，更缺乏看清这一必然未来的产品与技术视野。

The correct agent platform that wins will function like the base of a garden, from which customers will plant their unique "seeds" to grow their own plants and trees, managed and evolved by agents, humans, and signals from the sensors of the business. This presents a clearer picture than "factory of a factory" imo.

最终胜出的正确 Agent 平台，其作用将更像一座花园的底座：客户在其中种下各自独特的“种子”，培育出属于自己的花木与大树，由 Agent、人类以及来自业务各类传感器的信号共同管理与演化。在我看来，这比“工厂的工厂（factory of a factory）”描绘得更加清晰。

### Agent platform 2027

### 2027 年的 Agent 平台

#### Agents as actors

#### 作为 Actor 的 Agent

The status quo for most scalable agent workloads is to deploy agents using some form of Temporal. I think this will shift toward actors that allow each agent harness to have a fully independent runtime. The actor model provides runtime isolation, which is necessary for self-improving harnesses, where self-improving refers to an agent being able to write its own extensions or hooks on the fly. Actors help because they allow different implementations of the agent loop to run safely on the same platform backend, even within a single tenant.

目前，大多数可扩展的 Agent 工作负载都是基于某种形式的 Temporal 来部署的。我认为这一现状将会转向 Actor 模型（actor model），让每个 Agent Harness（运行时外壳）都拥有完全独立的运行时环境。Actor 模型提供了运行时隔离，这对于能够自我改进的 Harness 至关重要——所谓自我改进，是指 Agent 能够实时为自己编写扩展（extensions）或钩子（hooks）。Actor 的价值在于，它允许不同实现的 Agent 循环在同一个平台后端上安全运行，甚至是在同一个租户内部。

The platform should support a variety of agent configurations, separating the definition of an agent from its instances and sessions. Some users may want a mega-agent, but others may prefer bespoke agent definitions. Most notably, Anthropic argues for one mega-agent, but its revealed preference in Formalizing Fermat's Last Theorem suggests something different: each agent had access to only a shell and a file editor. It's unclear to me whether, even if Opus can distinguish the right tools, the researcher would have wanted agents loaded with Gmail, Google Drive, and internet search MCPs when commanding this swarm. Therefore, even within companies advocating for one mega-agent, my observation is that their revealed preference is closer to a code-defined "Grokbot" model.

平台应当支持多种 Agent 配置，并将 Agent 的定义与其运行实例（instances）及会话（sessions）解耦。有些用户可能想要一个无所不能的“巨型 Agent（mega-agent）”，但另一些用户可能更倾向于定制化的 Agent 定义。最典型的例子是，Anthropic 口头上主张单一巨型 Agent，但它在《形式化费马大定理》（Formalizing Fermat's Last Theorem）中的显示偏好（revealed preference）却呈现出另一番景象：每个 Agent 只被授予了 Shell 和文件编辑器的访问权限。我不确定，即便 Opus 能够分辨出该用哪些工具，研究人员在指挥这个 Agent 集群时，是否真的希望每个 Agent 都挂载着 Gmail、Google Drive 和联网搜索的 MCP。因此，据我观察，即便是在倡导单一巨型 Agent 的公司内部，它们的实际偏好也更接近一种由代码定义的“Grokbot”模式。

*Relevant: Cloudflare DO, Pi-Durable x Extensions, Vercel Eve, Rivet, DeepSeek Agent*

*相关参考：Cloudflare DO、Pi-Durable x Extensions、Vercel Eve、Rivet、DeepSeek Agent*

#### Environments and computers

#### 环境与计算设备

There are two types of computers the platform needs to support: clones of checkpointed sandboxes across a variety of providers, and people's local computers. N agents should be able to work with M computers (e.g., one agent spinning up five sandboxes to experiment with different configurations, one VM per coding agent with a full environment, or 1,000 agents using 100 VMs in parallel as a swarm). These environments should be configurable agentically.

平台需要支持两类计算设备：一类是跨多家供应商、基于检查点克隆出来的沙盒（checkpointed sandboxes），另一类是用户的本地电脑。N 个 Agent 应当能够灵活地与 M 台电脑协同工作（例如，1 个 Agent 拉起 5 个沙盒以测试不同配置，每个编码 Agent 独占一台带完整环境的虚拟机，或者 1,000 个 Agent 作为集群并行使用 100 台虚拟机）。此外，这些运行环境应当能够由 Agent 自主配置。

*Relevant: Claude Remote, Cursor Agent, Cua AI*

*相关参考：Claude Remote、Cursor Agent、Cua AI*

#### RBAC-ed filesystem

#### 带 RBAC 权限控制的文件系统

Swarms of agents will operate on a shared POSIX filesystem in the cloud, with access controls attached to the filesystem separately from the computer. This layer acts as part GitHub, where agent-generated code, extensions, and definitions live; part Google Drive, where uploaded, downloaded, and generated files and "apps" live; and more. Since it's effectively a remote shared filesystem, you could host `.env` files and have each directory use `.git` or `jj` for version control. There will be various configurations of RBAC that organizations will want, whether it's agents like humans, or permission granted based on who initiated the particular turn, or a mixture of both.

Agent 集群将在云端的一个共享 POSIX 文件系统上协同运作，而访问控制（RBAC，基于角色的访问控制）将独立于具体计算设备、直接挂载在文件系统之上。这一层一方面像 GitHub，存放 Agent 生成的代码、扩展和定义；另一方面像 Google Drive，存放上传、下载以及生成的文件和“应用（apps）”，而且功能不止于此。由于它本质上是一个远程共享文件系统，你可以在其中托管 `.env` 文件，并让每个目录使用 `.git` 或 `jj` 进行版本控制。不同组织会对 RBAC 有多种配置需求——无论是把 Agent 当作人类成员来赋权，还是根据触发当前这一轮交互的发起者来动态授权，亦或是两者的混合模式。

*Relevant: Archil, S3 Filesystems, JuiceFS*

*相关参考：Archil、S3 Filesystems、JuiceFS*

#### Separation of session and conversation

#### 会话与对话的分离

The status quo for most coding agent applications is to expose the agent session, including its intermediate tool calls, directly to the user. I think this is wrong.

目前大多数编码 Agent 应用的做法，是把底层的 Agent 会话（session）——包括其中间过程的所有工具调用——直接暴露给用户。我认为这是错的。

What the user interacts with should be abstracted from the core agent session as a "conversation." Your app should natively have a concept of a conversation, at the same level of abstraction as a Slack channel, iMessage chat, WhatsApp conversation, or email thread. Content intended for the user should be posted through a tool call rather than by directly exposing the assistant messages from the underlying agent session.

用户真正交互的对象，应当从核心 Agent 会话中抽象出来，成为一种“对话（conversation）”。你的应用应该原生具备对话的概念，其抽象层级与 Slack 频道、iMessage 聊天、WhatsApp 对话或邮件线程相当。凡是打算给用户看的内容，都应当通过一次工具调用来发送，而不是直接把底层 Agent 会话里的 assistant 消息裸露出来。

Direct access to agent sessions should be akin to reading the codebase: a way to inspect and debug the system, rather than the primary user interface.

直接查看 Agent 会话，应当类似于阅读代码库：它是一种用于检查和调试系统的手段，而不是主要的用户界面。

ADEs created in 2025–2026 that wrap coding agent sessions (e.g., T3) will face the same kind of dilemma Cursor faced in 2025–2026. I suspect most will not survive this transition because of the innovator's dilemma.

2025–2026 年间诞生的那些直接封装编码 Agent 会话的 ADE（例如 T3），将会面临与 Cursor 在 2025–2026 年所遭遇的同类困境。我怀疑大多数产品都会因为“创新者窘境（innovator's dilemma）”而无法挺过这次转型。

*Relevant: Duet / Grokbot / Dots*

*相关参考：Duet / Grokbot / Dots*

#### Inbox

#### 收件箱

Rather than reading through conversations, users will increasingly interact with a focused inbox of approvals and questions. The inbox should also support tenant-specific apps for reviewing intermediate work relevant to the business that requires human action.

用户将越来越少地逐条翻阅对话，而是转向一个聚焦于审批与提问的收件箱（Inbox）。这个收件箱还应当支持嵌入租户专属的应用，方便人类审阅与具体业务相关、需要人工拍板的中间工作成果。

*Relevant: MS Today by @nicbstme*

*相关参考：@nicbstme 打造的 MS Today*

#### Listeners, monitors, single-tenant data

#### 监听器、监控器与单租户数据

Agents should be able to define streams of events from the external world to listen to on a per-tenant basis (WSS, Kafka streams, CDC, etc.) and translate those events, deterministically or agentically, into signals they can act on. These listeners should be buildable on the fly rather than requiring built-in support from the agent platform. This supports agents to define any form of integration to the outside world either as code or as agent. Anything from “I want my Capy Captain / Dots / Duet / main Grok Bot actually have a function for which every email comes in, have JEV filter over it, and trigger an agent run on that email” / “Nevermind, I actually want it to be batches of emails across all my accounts” / “Actually, I want emails from senders with acmecorp.com to be handled for the next week because we need to watch for specific emails from them but I need it to be time sensitive”. Right now, the industry (Grok bot, Muse, Instinct, etc) really only supports hourly cron jobs that trigger an agent from a generalized platform perspective, and if not otherwise write bespoke webhook integration as plugins into these platforms - listeners and monitors as a concept is a strict superset that supports tenants to flexibly configure the type of event-driven mechanism the actual core agent should reason over.

Agent 应当能够按租户定义要监听的外部世界事件流（如 WSS、Kafka 流、CDC 变更数据捕获等），并以确定性逻辑或智能体方式将这些事件转化为可供行动的信号。这些监听器应当可以随时即时构建，而无需依赖 Agent 平台的内置支持。这让 Agent 既能以代码形式、也能以 Agent 形式，定义与外部世界的任意集成——无论是“我想让我的 Capy Captain / Dots / Duet / 主 Grok Bot 拥有一个功能：每来一封邮件，就让 JEV 过滤一遍，并对这封邮件触发一次 Agent 运行”，还是“算了，我其实想把我所有账号的邮件按批处理”，又或是“其实接下来一周我想专门处理来自 acmecorp.com 发件人的邮件，因为我们需要盯紧他们的特定来信，而且对时效性要求很高”。目前，整个行业（如 Grok bot、Muse、Instinct 等）从通用平台视角看，基本只支持每小时跑一次 cron 定时任务来触发 Agent，否则就得为平台编写定制化的 Webhook 集成插件；相比之下，监听器与监控器（listeners and monitors）这一概念是它们的严格超集，能够支持各租户灵活配置核心 Agent 究竟该基于何种事件驱动机制来进行推理。

*Relevant: Claude Code Monitor, Grokbot future feature*

*相关参考：Claude Code Monitor、Grokbot 未来特性*

#### Workflows

#### 工作流

Agents should be able to define durable workflows on a per-tenant basis. Many business and enterprise workflows operate over long horizons and involve a mixture of agentic and deterministic steps. The paradigm of shoddily defined drag-and-drop workflow automation (n8n, the original Zapier) is inferior to writing custom code. Given that the agent platform centralizes data flows through APIs and MCPs, it should also be the place where workflows are defined. But these should be code-defined workflows rather than drag-and-drop automations.

Agent 应当能够按租户定义持久化工作流（durable workflows）。许多商业和企业级流程跨越很长的时间周期，并且混合了智能体步骤与确定性步骤。粗制滥造的拖拽式工作流自动化范式（如 n8n、早期版本的 Zapier）远不如直接编写定制代码。既然 Agent 平台已经通过 API 和 MCP 集中了所有数据流，它自然也应该成为定义工作流的地方——但这些工作流应当是由代码定义的，而不是靠拖拽拼出来的自动化流程。

*Relevant: Zapier Zap, Rivet Workflows*

*相关参考：Zapier Zap、Rivet Workflows*

#### Apps

#### 应用层

Aka Artifacts.

也就是 Artifacts（产物/微应用）。

The status quo is that people view Replit as one category, separate from Claude Artifacts, ChatGPT Apps, or embedded widgets in ChatGPT. I think this is wrong. These all converge on the same idea of an app. All interfaces should be apps in your filesystem that users can customize. For example, the entire `/conversations` page should be defined as an artifact. Each user would get a "clone" of the codebase in their filesystem that can be extended or modified as needed. This parallels how an OS ships with default applications.

目前的普遍认知是把 Replit 归为一类，并与 Claude Artifacts、ChatGPT Apps 或 ChatGPT 中的嵌入式小组件区分开来。我认为这种看法是错的。它们最终都会收敛到同一个概念——App（应用）。所有界面都应当是你文件系统里可供用户自定义的应用。例如，整个 `/conversations` 页面本身就应该被定义为一个 Artifact。每个用户都会在自己的文件系统中获得一份代码库的“克隆副本”，可以按需扩展或修改。这与操作系统出厂自带默认应用的模式如出一辙。

"Generative UI is going to come with default design components and be represented as JSON to be token-efficient!"

“生成式 UI（Generative UI）会自带默认设计组件，并用 JSON 表示以节省 token！”

"No, we're going to have a separate DSL that's an HTML hybrid to be more flexible."

“不，我们要做一个独立的 HTML 混合 DSL，这样更灵活。”

"No, we're going to have everything be a Rune App."

“不，我们要让所有东西都成为 Rune App。”

I think the answer is that the platform will simply support all of these under the concept of an App, and the specific representation won't matter as much.

我认为答案其实很简单：平台会在 App 这一统一概念下同时支持所有这些形式，而具体的底层表示方式并没有那么重要。

The agent platform becomes the OS within which all these apps are built. At first glance, it's not obvious why we need an OS within an OS.

Agent 平台将成为构建所有这些应用的操作系统。乍一看，我们似乎看不出为什么需要在操作系统里面再套一个操作系统。

The core reason, and the value to the user, comes down to the customizability and extensibility of the application layer built on top of the underlying OS.

核心原因——也是对用户的真正价值所在——归根结底在于构建于底层操作系统之上的应用层所具备的可定制性与可扩展性。

Consider how ten different accounting companies review tax forms. Every company within a vertical shares the same "noun" of "review XYZ," but the process by which each company evaluates and understands the information is bespoke. Ideally, these companies could fork Excel and create bespoke interfaces for their workloads.

试想十家不同的会计师事务所是如何审核税务报表的。同一垂直行业里的每家公司，表面上共享着同一个“名词”——“审核某某表”，但每家公司评估和理解信息的具体过程都是高度定制化的。理想情况下，这些公司应该能够直接 fork 一份 Excel，为自己的工作负载打造专属界面。

This is exactly the assumption behind vertical SaaS: that companies within a vertical share enough common workflows to justify common ways of representing them. But I think this idea is broken as a venture thesis, at least in its original form. The best vertical SaaS products eventually evolve into configurable platforms, with internal or external sales engineers, consultants, and deployment teams responsible for configuring the apps for each company. Which then begs the question, why do you want a shittier platform than a generalized one where the agent can fully operate on?

这正是垂直 SaaS 背后的核心假设：同一垂直行业里的企业共享足够多的通用工作流，因此值得用统一的方式去呈现它们。但我认为这一理念作为风投逻辑已经破产，至少其原始形态如此。最优秀的垂直 SaaS 产品最终都会演变成可配置平台，需要配备内部或外部的售前工程师、顾问和部署团队，为每家公司量身配置应用。而这就引出了一个直击要害的问题：既然如此，为什么还要选一个更蹩脚的平台，而不是选一个 Agent 可以在其上充分运作的通用平台呢？

My view is that this entire process will be done by agents on command, down to the most granular interface (whether you call it a single Claude Artifact or something else). Instead of relying on a vendor's implementation team to customize the software, users will be able to ask their agents to modify the applications directly. Creating these types of reverse-engineering artifacts is simply not friendly within the bounds of existing OS, but a separate application, whether on the browser or as a desktop application, has the full opportunity to support this.

我的观点是，整个定制过程未来都将由 Agent 按指令完成，一直细化到最微小的界面单元（无论你管它叫单个 Claude Artifact 还是别的什么）。用户不再需要依赖软件供应商的实施团队来定制软件，而是可以直接让自己的 Agent 修改应用。在现有操作系统的边界内，要构建这类可被“逆向重构”的交互产物（reverse-engineering artifacts）并不友好；但一个独立的应用层——无论是运行在浏览器中还是作为桌面应用——完全有机会提供这种支持。

T3, Claude Cowork with customization, and installable Claude Artifacts all point in this direction.

T3、支持自定义的 Claude Cowork，以及可安装的 Claude Artifacts，全都指向了这个方向。

We will have different containers for apps (which themselves can also be apps):

未来我们还会拥有多种承载 App 的容器（而这些容器本身也可以是 App）：

- **Tmux-like interfaces.** Already heavily explored by the better coding agent applications.
- **类 Tmux 界面。** 优秀的编码 Agent 应用已经在这方面做了大量探索。
- **Apps embedded within messages.** Already a default pattern, with apps in the sidebar also becoming standard in 2025–2026.
- **内嵌于消息中的 App。** 这已经成为默认模式，而在侧边栏展示 App 也在 2025–2026 年逐渐成为标配。
- **App-centered interfaces with chat in the sidebar.** This inverts the relationship, making the app primary and chat secondary (e.g., Claude in Excel), similar to how agents are embedded in existing applications.
- **以 App 为中心、聊天置于侧边栏的界面。** 这种形态反转了主次关系，让应用成为主体、对话退居辅助（例如 Excel 中的 Claude），类似于 Agent 嵌入现有软件的方式。

These types of views will continue to exist. But we'll also have:

上述几类视图仍将继续存在。但我们还会迎来：

- **Infinite canvases (tldraw).** Useful for expressing things like ComfyUI workflows or designs in tools like Paper or Figma, where an interface could be represented as an infinite canvas with each component being an image-display App.
- **无限画布（tldraw）。** 适合用来呈现类似 ComfyUI 工作流，或者 Paper、Figma 等设计工具中的界面——整个界面可以表现为一块无限画布，而其中的每个组件都是一个负责展示图像的 App。
- **Fixed canvases with layered windows.** The default OS experience.
- **带分层窗口的固定画布。** 即经典的操作系统默认体验。
- **Resizable panels with fixed widths and heights.** Similar to Metabase.
- **固定宽高网格下的可缩放面板。** 类似于 Metabase 的布局方式。

*Relevant: Rex, OpenCode Rune*

*相关参考：Rex、OpenCode Rune*
