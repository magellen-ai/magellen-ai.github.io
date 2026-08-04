---
title: "Harness 是底盘 模型是引擎"
date: 2026-04-28
tags: [llm, agent, harness]
source: "02_领域笔记/大模型/wiki/Agent/Agent Harness/Harness 是底盘 模型是引擎.md"
---

# Harness 是底盘 模型是引擎

> Agent Harness 是底盘；模型是引擎。

这句话不是说模型不重要，而是说在 agent 场景里，模型能力会被工具、上下文、环境、评分、预算和执行循环共同放大或折损。

## 三个标志性实证

- Pi Research SWE-bench 实证：只改编辑工具格式，SWE-bench 6.7% → 68.3%
- LangChain Terminal Bench 实证：模型固定，只改 harness，Terminal Bench 52.8% → 66.5%
- GAN 对抗式 Harness / Planner-Generator-Evaluator：单 agent 原型与长运行三 agent harness 的产物质量发生 phase change

## 为什么 harness 影响巨大

1. **工具接口决定可行动作空间**：工具描述、参数 schema、编辑格式会改变模型能否正确操作环境
2. **上下文管理决定注意力分配**：什么进入上下文，什么留在外部状态，直接影响长任务稳定性
3. **评估接口决定学习方向**：没有 trace 和 grader，就只能凭感觉调 prompt
4. **执行循环决定失败恢复**：没有 build-verify 循环，agent 很容易过早停止
5. **预算策略决定搜索深度**：预算感知执行会让同一模型呈现不同探索能力

## 反向提醒

Harness 不是越复杂越好。每个组件都编码了对当前模型局限的假设，模型升级后应重新检查。

## 相关

[Agent Harness 定义](/notes/Agent%20Harness%20%E5%AE%9A%E4%B9%89) · Harness 完备性矩阵 · Harness 简化原则
