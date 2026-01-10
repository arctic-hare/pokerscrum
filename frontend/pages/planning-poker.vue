<template>
  <div>
    <h1>Planning Poker — онлайн покер планирования задач</h1>
    <img :src="scrumPlanningPokerImage" alt="Planning Poker" />
    <h2>Составление колоды карт и определение согласованного количества очков (сюжетных баллов)</h2>
    <table>
      <tr>
        <th>Цель</th>
        <th>1-10</th>
        <th>Fibonacci</th>
        <th>Fibonacci modified</th>
        <th>Степень 2</th>
      </tr>
      <tr v-for="(value, i) in table" :key="i">
        <th>{{ value.target }}</th>
        <th>{{ i }}</th>
        <th>{{ value.fb }}</th>
        <th>{{ value.fbm }}</th>
        <th v-if="value.sqrt !== null">{{ value.sqrt }}</th>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import scrumPlanningPokerImage from '~/assets/images/scrum-planning-poker.jpg';

useHead({
  title: 'Planning Poker - описание, правила, оценка',
  meta: [
    {
      name: 'description',
      content:
        'Planning Poker - это метод, используемый в гибком управлении проектами для оценки трудозатрат, необходимых для выполнения пользовательских историй.',
    },
  ],
});

const table = [
  {
    target: 'Не требует усилий',
    fb: 0,
    fbm: 0,
    sqrt: 0,
  },
  {
    target: 'Без сложностей',
    fb: 1,
    fbm: 0.5,
    sqrt: 1,
  },
  {
    target: 'Минимальная сложность',
    fb: 2,
    fbm: 1,
    sqrt: 2,
  },
  {
    target: 'Минимальная сложность плюс некоторые неизвестные факторы',
    fb: 3,
    fbm: 2,
    sqrt: null,
  },
  {
    target: 'Низкая сложность',
    fb: 5,
    fbm: 3,
    sqrt: 4,
  },
  {
    target: 'Средняя-низкая сложность',
    fb: 8,
    fbm: 5,
    sqrt: null,
  },
  {
    target: 'Средняя сложность',
    fb: 13,
    fbm: 8,
    sqrt: 8,
  },
  {
    target: 'Высокая сложность',
    fb: 21,
    fbm: 13,
    sqrt: 16,
  },
  {
    target: 'Очень высокая сложность',
    fb: 34,
    fbm: 20,
    sqrt: 32,
  },
  {
    target: 'Чрезвычайно высокая сложность',
    fb: 55,
    fbm: 40,
    sqrt: null,
  },
  {
    target: 'Максимально возможная сложность',
    fb: 89,
    fbm: 100,
    sqrt: 64,
  },
];
</script>
