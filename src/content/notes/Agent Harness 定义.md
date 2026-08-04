---
title: "Agent Harness 定义"
date: 2026-04-28
tags: [llm, agent, harness]
source: "02_领域笔记/大模型/wiki/Agent/Agent Harness/Agent Harness 定义.md"
---

Agent Harness 是围绕 LLM Agent 搭建的一层基础设施: 负责构造任务环境、驱动多轮交互、记录完整轨迹、并在可复现条件下对结果打分与执行任务。

## 与传统 test harness 的类比

类比软件工程中的 test harness — wrap 被测对象,管理 setup/teardown、提供输入、收集输出。但 Agent Harness 面向具备**工具调用、多轮推理、外部状态修改**能力的 LLM Agent,因而需要处理: 非确定性 API、环境状态漂移、多步任务的过程指标、工具协议、上下文工程等。

## Anthropic 的官方定义

> "End-to-end infrastructure that runs the eval: provides the task description and tools, drives the task, records all interactions, and executes the grading logic."

注意: Anthropic 强调 "评估的对象不是模型本身,而是模型 + harness 整体",同一模型换 harness 表现可大幅变化。详见 [Harness 是底盘 模型是引擎](/notes/Harness%20%E6%98%AF%E5%BA%95%E7%9B%98%20%E6%A8%A1%E5%9E%8B%E6%98%AF%E5%BC%95%E6%93%8E)。

## HuggingFace Survey 的形式化定义

将 Agent Harness 形式化为六元组 **H = (E, T, C, S, L, V)**。

## 关键角色

- **替模型承担局限**: harness 的每个组件都编码了对模型当前能力局限的假设
- **隔离两类因素**: 模型本身的能力 vs 执行环境/工具/协议
- **可重复评估的载体**: 控制 API 非确定性、状态漂移等混淆变量
- **生产可靠性的瓶颈**: 而非模型能力本身决定大规模部署可靠性

## 易混淆术语

Harness、Scaffold、Framework 三个词经常混用,注意区分:Harness 强调"评估执行环境",Scaffold 强调"应用搭建脚手架",Framework 更泛化。
