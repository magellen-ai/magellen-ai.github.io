---
title: "编排税(The Orchestration Tax)"
date: 2026-05-24
tags: [翻译, agent, ai-coding, multi-agent, software-engineering]
summary: "启动代理很容易,但判断力不可并行。Addy Osmani 谈 agent 工作流中的编排税:为什么跑 20 个代理不等于 20 倍产出,以及如何像设计并发系统一样设计你的注意力。"
original: "https://addyosmani.com/blog/orchestration-tax/"
---

## 精选点评

### 1. 多开 Agent 不等于多了几个自己

这篇文章最重要的提醒，是把“多 Agent 编程”重新看成一个并发系统：Agent 可以并行生产，但理解架构、判断正确性、审查代码和解决冲突，仍然需要人类这个串行处理器。真正的瓶颈不是 Agent 数量，而是人类的判断吞吐量。

### 2. 编排税是架构问题，不是努力程度问题

当任务队列超过自己的审查能力时，继续增加 Agent 只会制造更多上下文切换、代码积压和认知债务。更合理的做法是根据评审速率控制并发，用自动化测试消化可验证部分，把稀缺注意力留给真正需要判断的工作。

### 3. 与 Agent Harness 的关系

Harness 不只是让 Agent 跑起来，也要管理 Agent 产出如何进入人的判断环节。背压、批量评审、任务分类、自动验证，都是围绕“人类是串行瓶颈”这一事实设计 Harness。

## 全文总结

本文探讨了在使用多个 AI 代理开发时出现的“编排税”（Orchestration Tax）问题。作者指出，虽然启动多个代理非常容易，但人类开发者作为系统的唯一串行处理器，其认知带宽无法并行化。所有判断、代码审查、解决冲突等关键工作仍需通过人类这一“瓶颈”完成。这导致运行更多代理并不能带来成比例的生产力提升，反而可能因频繁的上下文切换和无限增长的任务队列而导致疲劳与代码质量下降。

文章将此类比于并发编程中的“全局解释器锁”（GIL）和阿姆达尔定律，强调结构性限制无法通过增加代理数量来克服。作者提出，开发者应像设计分布式系统一样设计自己的注意力分配，通过控制代理数量（匹配实际审查能力）、分类任务、批量审查、利用自动化验证以及保护深度思考时间等方式，主动管理这一“税负”。最终，文章强调“感觉忙碌”与“高效产出”存在本质区别，忽视编排税会导致技术债务与认知债务的双重累积。

## 要点总结

1. **核心矛盾**：代理数量的增加受限于人类唯一的串行判断力（“编排税”），无法直接转化为生产力。
2. **系统类比**：人类是 AI 代理系统中的“全局解释器锁”与性能瓶颈（阿姆达尔定律中的串行部分）。
3. **效率陷阱**：运行大量代理产生的“忙碌感”可能掩盖实际产出不足的现实，导致效率错觉。
4. **结构问题**：该问题本质上是架构问题，而不是纪律问题，不能仅靠更努力工作解决。
5. **控制并发**：代理数量应匹配个人实际代码审查容量。
6. **任务分类**：区分可异步处理的隔离任务与依赖判断的复杂任务。
7. **批量处理**：减少上下文切换成本，集中处理代理产出。
8. **自动验证**：利用测试、截图等让代理证明其工作的非判断部分。
9. **保护专注**：为需要深度判断的工作保留不受打扰的串行处理时间。

## 内容原文(沉浸式翻译)

Starting more agents is easy now. However, more agents running doesn’t mean more of you available - your cognitive bandwidth doesn’t parallelize. All the judgement to actually steer them and merge the code they write into the codebase still has to route through exactly one serial processor which is just you. Orchestration tax is basically the price you pay for forgetting this and the only real fix is to start architecting your own attention like you architect any concurrent system.

启动更多代理如今轻而易举。然而，运行更多代理并不意味着你有更多精力可用——你的认知带宽无法并行处理。所有真正指引代理并将它们编写的代码整合进代码库中的判断工作，仍然必须通过恰恰只有一个串行处理器来完成，那就是你自己。编排税本质上是你遗忘这一点所付出的代价，唯一的解决方法是像架构任何并发系统那样，开始架构你自己的注意力。

I was in a panel at Google I/O this week with Richard Seroter, Aja Hammerly and Ciera Jaspan talking about what software engineering looks like right now and how it will probably evolve. Near the end Richard asked us what is one thing developers should walk away and do differently. I said the thing I been circling around for months: feeling busy is definetly not the same as being productive. You can run 20 agents and feel completely busy. But thats not 20 agents worth of shipped work.

本周我在 Google I/O 的一个小组讨论中与 Richard Seroter、Aja Hammerly 和 Ciera Jaspan 一起探讨了当下软件工程的面貌及其可能的演变。临近结束时 Richard 问我们，开发者应该带回去改变的一件事是什么。我说了几个月来一直在琢磨的事情：感觉忙碌绝对不等于高产。你可以运行 20 个代理并感到完全忙得不可开交，但那并不是 20 个代理工作量的产出。

Earlier in that chat Richard gave this problem a name. “You talked about the orchestration tax” he said. “You can’t manage twenty agents successfully in your own brain.” He is totally right. I want to breakdown this idea properly because its not a discipline problem. It is an architecture problem.

在早些时候的讨论中，Richard 给这个问题起了个名字。“你谈到了编排税，”他说，“你无法在自己大脑里成功管理 20 个代理。”他完全正确。我想要恰当地拆解这个想法，因为它不是一个纪律问题，而是一个架构问题。

The line from the panel I keep thinking about is something I said almost randomly: running multiple agents does not mean there is more of you.

小组讨论中我随口说出的那句话让我一直思考：运行多个代理并不意味着有更多个你。

## The asymmetry people don’t price in

## 人们没有计入的不对称性

There is this hidden asymmetry in agentic workflows. Starting an agent is very cheap. It is just a keystroke or a sentence prompt. But closing the loop on the agent is not cheap at all. Someone has to check if what came back is correct and reconcile it with whatever the other agents touched. That someone is you. And there is exactly one of you.

在代理工作流中存在着这种隐藏的不对称性。启动一个代理非常廉价，只需按一个键或输入一句提示。但完成代理的循环一点都不廉价。需要有人检查返回的结果是否正确，并与其他代理触及的内容进行协调。那个人就是你，而且恰恰只有一个你。

I wrote about a piece of this last month in Your parallel Agent limit, mostly about the ambient anxiety of not knowing which paralell thread is quietly failing. This post is about the actual shape underneath that cost. When you start seeing agent development as a concurrent system, you realize the human is just a component inside it. The slow serial component.

上个月我在《你的并行代理限制》中写过其中一部分，主要关于不知道哪个并行线程正悄然失败的那种背景性焦虑。这篇文章要探讨的是这种代价之下的实际形态。当你将代理开发视为一个并发系统时，你意识到人类只是其中的一个组件，一个缓慢的串行组件。

## You are the single thread resource

## 你是单线程资源

If you ever wrote concurrent code you already have the right intuition. You just been pointing it at the wrong part of the system.

如果你写过并发代码，你已经有了正确的直觉，只是把它用在了系统的错误部分。

Python has the Global Interpreter Lock (GIL). You can spawn as many threads as you want but only one executes python bytecode at a time because they must acquire the lock. You are the GIL of your AI agents. They all can run at once. But when any of their work needs genuine understanding of the architecture or resolving merge conflicts, that work has to acquire the lock. There is one lock. You hold it.

Python 有全局解释器锁（GIL）。你可以随意生成线程，但一次只有一个线程能执行 Python 字节码，因为它们必须获取锁。你就是你的 AI 代理的 GIL。它们可以同时运行，但当任何代理的工作需要真正理解架构或解决合并冲突时，那项工作就必须获取这把锁。只有一把锁，由你持有。

Amdahl’s Law makes this very precise. The speedup you get from paralellizing is capped by the fraction of work that stays serial. If a big chunk of your pipeline cant be paralellized, you top out at a hard limit no matter how many cores you throw at it. In agent development the serial fraction is the judgement. Spawning 8 agents doesn’t speed up your judgement time. It just makes the queue of things feeding into it much deeper.

阿姆达尔定律对此给出了精确描述。从并行化中获得的加速受限于保持串行的工作比例。如果流程中有很大一部分无法并行化，那么无论投入多少核心，最终都会达到一个硬性上限。在代理开发中，串行部分就是判断。生成 8 个代理并不会加快你的判断时间，只会让等待判断的队列变得更深。

This is an old performance engineering fact that still surprise people: optimizing the non bottleneck part doesn’t increase throughput. You just grow the pile of unfinished work sitting in front of the bottleneck. Adding agents optimize the part that was never the constraint. The constraint is the review step and the throughput of your system equals exactly the throughput of that step. The orchestration tax is the structural gap between agent production and what you can actually merge. It’s what happens when you put a single-threaded resource in charge of a concurrent one.

这是一个依然令人惊讶的性能工程事实：优化非瓶颈部分并不能提高吞吐量。你只会增加堆积在瓶颈前的未完成工作量。增加代理优化的是从来不是约束所在的部分。约束是审查步骤，而系统吞吐量恰好等于该步骤的吞吐量。编排税是代理产出与你实际能整合的内容之间的结构性差距。这就是当你将单线程资源置于并发系统之上时会发生的事情。

## Grinding won’t fix structural limits

## 埋头苦干无法解决结构性限制

At the panel I said I never felt more productive with my tools but I am also more tired than I ever been. Both halves are completely real and they have the same cause.

在小组讨论中我说过，我从未感觉工具让我更高效，但也从未感觉如此疲倦。这两方面完全真实，且有其相同根源。

The tiredness has a very specific cause. It is how running a serial processor at 100% with no slack feels like. Everytime you check on an agent you been away from you pay a context switch cost. You flush your brain and reload a different context from cold. CPUs do this in microseconds and architects still work hard to avoid it. You do it in minutes and you never reload the context perfectly. Five agents is not 1x workload done five times. It is 5 cold reloads plus a background brain process constantly worrying about which agent you should be checking.

疲倦有一个非常具体的原因：这就是将一个串行处理器以 100% 负载、没有余裕运行时的感受。每次你去检查一个离开了一阵的代理，都要支付上下文切换的成本。你清空大脑，再从冷启动状态加载不同的上下文。CPU 在微秒内完成此操作，架构师们仍然努力避免它。你却需要几分钟，而且永远无法完美重载上下文。5 个代理不是 1 倍工作量做 5 次，而是 5 次冷启动，加上一个在后台持续担心该检查哪个代理的大脑进程。

You can’t just try harder to fix a structural limit. The tax will be paid anyway. If you try to grind it out, the limit just shows up as shallow code reviews or experiencing cognitive surrender where you just accept the agent’s code because forming your own opinion costs attention you don’t have anymore. You either pay the tax deliberately or you let it quietly destroy your understanding of your own system.

你不能仅仅通过更努力来解决结构性限制。税无论如何都要支付。如果你试图埋头苦干，限制只会表现为肤浅的代码审查，或是经历认知投降——你直接接受 Agent 编写的代码，因为形成自己的判断需要你已经不再拥有的注意力。你要么刻意支付这笔税，要么让它悄无声息地摧毁你对自己系统的理解。

## Architect your attention

## 设计你的注意力

So you have to treat your attention as the scarce serial resource it is. You wouldn’t design a distributed system without thinking hard about the bottleneck. Give your brain the same respect.

因此，你必须把注意力视为它本来就是的稀缺串行资源。设计分布式系统时，你不会忽视瓶颈问题。请给予你的大脑同等重视。

Some things that actually held up for me:

以下是一些对我确实有效的方法：

Scale fleet to review rate, not the UI. A good concurrent system uses backpressure so the queue doesn’t grow infinitely. The producer slows down to match the consumer. Your agent count is the producer and your review rate is the consumer. The right number of paralell agents is how many you can actually code review properly. For most of us this is a low single digit. The AI tool will happily let you spawn 20 but that is just a UI feature.

根据评审速率而不是用户界面来扩展集群。优秀的并发系统会使用背压机制防止队列无限增长。生产者会减速以匹配消费者。你的代理数量是生产者，评审速率是消费者。合适的并行代理数量取决于你实际能够正确完成代码审查的量。对大多数人而言，这只是个位数。AI 工具会乐于让你同时生成 20 个代理，但那只是一个界面功能。

Sort the work. I mentioned this to Richard when he asked how I navigate it. I keep two piles of tasks. One is isolated work that I’m happy to delegate to background agents running in the Cloud. These can run async and often just need me at the final gate. The other pile is complex tasks where the judgement is the work. Like a weird bug or architecture design. The big mistake is trying to paralellize the second pile. Doing multiple complex tasks doesn’t scale your output. It just thrashes the lock and everything comes out worse.

分类处理任务。当 Richard 问我如何处理这些问题时，我提过这一点。我把任务分成两堆：一堆是独立工作，我很乐意委托给云端运行的后台代理。这些任务可以异步运行，通常只需要我在最后的门禁环节介入。另一堆是需要判断力的复杂任务，比如诡异的 Bug 或架构设计。最大的错误是试图把第二堆任务并行化。同时处理多个复杂任务不会扩大产出，只会让锁发生抖动，最后所有结果都更糟。

Batch your reviews. Context switching cost you heavily everytime you do it. Reviewing 4 agents at the same time in one sitting is much cheaper than checking one, leaving to do something else and returning cold. Give agents a long leash. Let the work pile up a bit and process the batch.

批量处理评审。每次上下文切换都会付出高昂代价。一次性评审 4 个代理的成本，远低于检查一个、离开去做其他事情、再冷启动回来。给代理充分的自主权。让工作稍微积压，然后批量处理。

Only spend the lock on judgement. Dont waste your brain on things the machine can verify itself. Make the agent write a passing test or generate a screenshot. They can prove the boring 80% themselves so you only spend your scarce attention on the 20% that genuinely needs a human.

只将锁资源用于判断。不要在机器能自行验证的事务上消耗脑力。让代理编写通过的测试或生成截图。它们可以自行证明那枯燥的 80%，这样你只需将稀缺注意力用于真正需要人类参与的 20%。

Protect your serial time. The bottleneck needs your best hours, not the leftover minutes between agent check-ins. Sometimes the highest leverage move is to stop orchestrating entirely, close the laptop full of agents and just think hard about one single problem with the lock held the whole time. Orchestrating is not the real work. Its the overhead around the work.

保护你的串行时间。瓶颈环节需要你最好的工作时段，而不是代理检查间隙剩下的几分钟。有时最高效的举措是完全停止调度，合上装满代理的笔记本，在整个过程中保持锁定，专心思考一个问题。调度不是核心工作，而是围绕工作的开销。

Aja pointed out that architecture is the urgent skill now. Knowing what belongs inside one agent and what is too much for it. I would add that you are a component in that system. Your attention has a known, low serial throughput. The system either respects that number or it routes around it by secretly lowering your standards.

Aja 指出，架构能力是当今迫切需要的技能：要知道哪些内容应该放进一个 Agent，哪些内容对它来说过多。我想补充的是，你本身就是这个系统中的一个组件。你的注意力具有已知且很低的串行吞吐量。系统要么尊重这个数值，要么通过暗中降低你的标准来绕过它。

## Busy vs Productive

## 忙碌 vs 高效

This is really important because the failure mode is invisible to you. Twenty running agents gives you this feeling of massive productivity. The dashboard is full and everything moves. But that feeling is decoupled from actually shipping good code to main. You can be maximally busy and barely produce anything. From the inside it feels identical.

这点至关重要，因为失败模式对你而言是隐形的。运行 20 个代理会带来巨大的生产力错觉。仪表盘很满，一切都在移动。但这种感受与实际向主分支交付优质代码是脱节的。你可以极度忙碌却几乎毫无产出。从内部感受来看，二者完全相同。

Ciera pointed out Margaret-Anne Storey’s work on debt. We talked about technical debt and cognitive debt. The orchestration tax left unpaid is how you accumulate both at once. You merge stuff you didn’t read well. Your mental model of the codebase goes completely stale. None of this shows up on the dashboard today. It shows up when production breaks and you look at the system and realize you have no idea how it works anymore.

Ciera 提到了 Margaret-Anne Storey 关于债务的研究。我们讨论了技术债务和认知债务。未支付的编排税会让你同时积累这两种债务。你合并了没有认真读过的内容。你对代码库的心智模型完全过时。这些今天都不会显示在仪表盘上。它们会在生产环境崩溃时出现：你看着这个系统，却意识到自己已经完全不知道它是如何运作的。

So this is the actual takeaway. Spawning agents is not the skill. Anyone can run 20. The real skill is designing the system around the one serial resource that cannot be cloned or paralellized. That resource is your attention. Architect it the way you architect anything else you depend on in production.

这才是真正的要点：生成代理不是核心技能，任何人都能运行 20 个。真正的技能在于围绕那种无法克隆或并行化的串行资源设计系统。这个资源就是你的注意力。像设计生产环境中的任何关键依赖一样设计它。
