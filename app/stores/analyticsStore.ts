import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useTaskStore } from './taskStore'
import { useTimeTrackerStore } from './timeTrackerStore'
import type {
  AnalyticsData,
  TimeDistribution,
  DailyStats,
  TopTag,
  AIInsight,
} from '@/types/analytics'

export const useAnalyticsStore = defineStore('analytics', () => {
  const taskStore = useTaskStore()
  const timeTrackerStore = useTimeTrackerStore()

  // Основные данные аналитики
  const analyticsData = computed<AnalyticsData>(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Статистика за сегодня
    const todayTasks = taskStore.tasks.filter((task) => {
      const taskDate = new Date(task.createdAt)
      return taskDate >= today
    })

    const todayStats = {
      totalTime: timeTrackerStore.todayTotalTime,
      completedTasks: todayTasks.filter((task) => task.completed).length,
      activeTasks: todayTasks.filter((task) => !task.completed).length,
    }

    // Статистика за неделю
    const weekTasks = taskStore.tasks.filter((task) => {
      const taskDate = new Date(task.createdAt)
      return taskDate >= weekAgo
    })

    const weekTime = weekTasks.reduce(
      (total, task) => total + task.totalTime,
      0
    )
    const weekCompleted = weekTasks.filter((task) => task.completed).length

    // Распределение времени по категориям
    const timeDistribution: TimeDistribution[] = []
    let totalTrackedTime = 0

    taskStore.categories.forEach((category) => {
      const categoryTasks = taskStore.tasks.filter(
        (task) => task.categoryId === category.id
      )
      const categoryTime = categoryTasks.reduce(
        (total, task) => total + task.totalTime,
        0
      )

      if (categoryTime > 0) {
        totalTrackedTime += categoryTime
        timeDistribution.push({
          categoryId: category.id,
          categoryName: category.name,
          color: category.color,
          totalTime: categoryTime,
          percentage: 0, // Будет вычислено позже
        })
      }
    })

    // Вычисляем проценты
    if (totalTrackedTime > 0) {
      timeDistribution.forEach((item) => {
        item.percentage = (item.totalTime / totalTrackedTime) * 100
      })
    }

    // Тренд по дням недели
    const weeklyTrend: DailyStats[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      )
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

      const dayTasks = taskStore.tasks.filter((task) => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= dayStart && taskDate < dayEnd
      })

      const dayTime = dayTasks.reduce(
        (total, task) => total + task.totalTime,
        0
      )
      const completedTasks = dayTasks.filter((task) => task.completed).length
      const totalTasks = dayTasks.length

      // Простая оценка продуктивности
      let productivityScore = 0
      if (totalTasks > 0) {
        const completionRate = (completedTasks / totalTasks) * 100
        const timeEfficiency =
          dayTime > 0 ? Math.min(dayTime / (8 * 60 * 60 * 1000), 1) * 100 : 0
        productivityScore = completionRate * 0.6 + timeEfficiency * 0.4
      }

      weeklyTrend.push({
        date,
        totalTasks,
        completedTasks,
        totalTime: dayTime,
        productivityScore,
      })
    }

    // Топ тегов
    const tagStats = new Map<string, { time: number; count: number }>()

    taskStore.tasks.forEach((task) => {
      task.tags.forEach((tagId) => {
        const tag = taskStore.getTagById(tagId)
        if (tag) {
          const current = tagStats.get(tagId) || { time: 0, count: 0 }
          tagStats.set(tagId, {
            time: current.time + task.totalTime,
            count: current.count + 1,
          })
        }
      })
    })

    const topTags: TopTag[] = Array.from(tagStats.entries())
      .map(([tagId, stats]) => {
        const tag = taskStore.getTagById(tagId)
        if (!tag) return null

        return {
          tagId,
          tagName: tag.name,
          color: tag.color,
          totalTime: stats.time,
          taskCount: stats.count,
        }
      })
      .filter((tag): tag is TopTag => tag !== null)
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 10)

    // Самый продуктивный день
    const mostProductiveDay = weeklyTrend.reduce((max, day) => {
      return day.productivityScore > max.productivityScore ? day : max
    }, weeklyTrend[0])

    // Статистика за месяц
    const monthTasks = taskStore.tasks.filter((task) => {
      const taskDate = new Date(task.createdAt)
      return taskDate >= monthAgo
    })

    const monthTime = monthTasks.reduce(
      (total, task) => total + task.totalTime,
      0
    )
    const monthCompleted = monthTasks.filter((task) => task.completed).length

    // Тренд продуктивности (сравнение с предыдущим периодом)
    const previousMonthStart = new Date(
      monthAgo.getTime() - 30 * 24 * 60 * 60 * 1000
    )
    const previousMonthEnd = monthAgo

    const previousMonthTasks = taskStore.tasks.filter((task) => {
      const taskDate = new Date(task.createdAt)
      return taskDate >= previousMonthStart && taskDate < previousMonthEnd
    })

    const previousMonthTime = previousMonthTasks.reduce(
      (total, task) => total + task.totalTime,
      0
    )
    const previousMonthCompleted = previousMonthTasks.filter(
      (task) => task.completed
    ).length

    let productivityTrend = 0
    if (previousMonthTime > 0) {
      const currentProductivity =
        monthCompleted / (monthTime / (60 * 60 * 1000) || 1)
      const previousProductivity =
        previousMonthCompleted / (previousMonthTime / (60 * 60 * 1000) || 1)
      productivityTrend =
        ((currentProductivity - previousProductivity) / previousProductivity) *
        100
    }

    return {
      today: todayStats,
      thisWeek: {
        totalTime: weekTime,
        completedTasks: weekCompleted,
        averageProductivity:
          weekTasks.length > 0
            ? weeklyTrend.reduce((sum, day) => sum + day.productivityScore, 0) /
              weeklyTrend.length
            : 0,
      },
      thisMonth: {
        totalTime: monthTime,
        completedTasks: monthCompleted,
        productivityTrend,
      },
      timeDistribution,
      weeklyTrend,
      topTags,
      mostProductiveDay: {
        day: mostProductiveDay.date.toLocaleDateString('ru-RU', {
          weekday: 'long',
        }),
        productivity: mostProductiveDay.productivityScore,
      },
    }
  })

  // Генерация AI инсайтов
  const generateAIInsights = (count: number = 5): AIInsight[] => {
    const insights: AIInsight[] = []
    const data = analyticsData.value
    const now = new Date()

    // 1. Инсайт по распределению времени
    if (data.timeDistribution.length > 0) {
      const topCategory = [...data.timeDistribution].sort(
        (a, b) => b.totalTime - a.totalTime
      )[0]
      const bottomCategory = [...data.timeDistribution].sort(
        (a, b) => a.totalTime - b.totalTime
      )[0]

      if (topCategory.percentage > 50) {
        insights.push({
          id: `insight_${Date.now()}_1`,
          type: 'suggestion',
          title: 'Баланс категорий',
          message: `Вы уделяете ${topCategory.percentage.toFixed(
            0
          )}% времени категории "${
            topCategory.categoryName
          }". Рассмотрите распределение времени на другие задачи.`,
          data: { category: topCategory },
          createdAt: now,
        })
      }
    }

    // 2. Инсайт по продуктивности
    if (data.thisWeek.averageProductivity < 50) {
      insights.push({
        id: `insight_${Date.now()}_2`,
        type: 'suggestion',
        title: 'Повышение продуктивности',
        message:
          'Ваша продуктивность на этой неделе ниже среднего. Попробуйте метод Pomodoro или разбейте большие задачи на мелкие подзадачи.',
        data: { productivity: data.thisWeek.averageProductivity },
        createdAt: now,
      })
    } else if (data.thisWeek.averageProductivity > 80) {
      insights.push({
        id: `insight_${Date.now()}_3`,
        type: 'positive',
        title: 'Отличная работа!',
        message:
          'Ваша продуктивность на этой неделе выше 80%. Продолжайте в том же духе!',
        data: { productivity: data.thisWeek.averageProductivity },
        createdAt: now,
      })
    }

    // 3. Инсайт по завершенным задачам
    const completionRate = taskStore.tasksStats.completionRate
    if (completionRate < 30) {
      insights.push({
        id: `insight_${Date.now()}_4`,
        type: 'suggestion',
        title: 'Завершение задач',
        message: `Только ${completionRate.toFixed(
          0
        )}% задач завершены. Попробуйте устанавливать реалистичные сроки и приоритеты.`,
        data: { completionRate },
        createdAt: now,
      })
    }

    // 4. Инсайт по самому продуктивному дню
    if (data.mostProductiveDay.productivity > 70) {
      insights.push({
        id: `insight_${Date.now()}_5`,
        type: 'achievement',
        title: 'Рекорд продуктивности',
        message: `Ваш самый продуктивный день: ${
          data.mostProductiveDay.day
        } (${data.mostProductiveDay.productivity.toFixed(
          0
        )}%). Попробуйте повторить этот результат!`,
        data: { day: data.mostProductiveDay },
        createdAt: now,
      })
    }

    // 5. Инсайт по тренду
    if (Math.abs(data.thisMonth.productivityTrend) > 20) {
      const trendType =
        data.thisMonth.productivityTrend > 0 ? 'улучшилась' : 'ухудшилась'
      insights.push({
        id: `insight_${Date.now()}_6`,
        type: data.thisMonth.productivityTrend > 0 ? 'positive' : 'negative',
        title: 'Динамика продуктивности',
        message: `За последний месяц ваша продуктивность ${trendType} на ${Math.abs(
          data.thisMonth.productivityTrend
        ).toFixed(0)}%.`,
        data: { trend: data.thisMonth.productivityTrend },
        createdAt: now,
      })
    }

    // Добавляем общие советы, если не хватает инсайтов
    const generalTips = [
      {
        type: 'suggestion' as const,
        title: 'Регулярные перерывы',
        message:
          'Делайте 5-минутные перерывы каждый час для поддержания концентрации.',
      },
      {
        type: 'suggestion' as const,
        title: 'Утренний планировщик',
        message: 'Планируйте задачи на день утром, чтобы четко понимать цели.',
      },
      {
        type: 'positive' as const,
        title: 'Отслеживание прогресса',
        message:
          'Вы молодец, что отслеживаете свое время! Это первый шаг к улучшению продуктивности.',
      },
    ]

    while (insights.length < count && generalTips.length > 0) {
      const tip = generalTips.shift()
      if (tip) {
        insights.push({
          id: `insight_${Date.now()}_${insights.length + 7}`,
          ...tip,
          data: {},
          createdAt: now,
        })
      }
    }

    return insights.slice(0, count)
  }

  // Генерация недельного отчета
  const generateWeeklyReport = () => {
    const data = analyticsData.value
    const stats = taskStore.tasksStats
    const insights = generateAIInsights(3)

    const report = {
      period: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        end: new Date(),
      },
      summary: {
        totalTasks: stats.total,
        completedTasks: stats.completed,
        totalTime: data.thisWeek.totalTime,
        averageProductivity: data.thisWeek.averageProductivity,
      },
      topCategories: [...data.timeDistribution]
        .sort((a, b) => b.totalTime - a.totalTime)
        .slice(0, 3),
      topTags: data.topTags.slice(0, 5),
      dailyPerformance: data.weeklyTrend,
      insights,
      recommendations: [
        data.thisWeek.averageProductivity < 60
          ? 'Сосредоточьтесь на задачах с высоким приоритетом в первой половине дня.'
          : 'Продолжайте текущие практики, они эффективны!',
        data.timeDistribution.length > 0 &&
        data.timeDistribution[0].percentage > 60
          ? `Балансируйте время между категориями. ${data.timeDistribution[0].categoryName} занимает большую часть времени.`
          : 'Хороший баланс между различными категориями задач.',
        stats.completionRate < 50
          ? 'Ставьте более реалистичные сроки для задач или разбивайте крупные задачи на подзадачи.'
          : 'Отличная ставка завершения задач!',
      ],
    }

    return report
  }

  // Экспорт данных аналитики
  const exportAnalyticsData = (format: 'json' | 'csv' = 'json') => {
    const data = analyticsData.value
    const report = generateWeeklyReport()

    if (format === 'csv') {
      // Простая CSV конвертация для основных данных
      let csv = 'Показатель,Значение\n'
      csv += `Общее время за неделю,${(
        data.thisWeek.totalTime /
        (60 * 60 * 1000)
      ).toFixed(2)} ч\n`
      csv += `Завершенные задачи,${data.thisWeek.completedTasks}\n`
      csv += `Средняя продуктивность,${data.thisWeek.averageProductivity.toFixed(
        1
      )}%\n`
      csv += `Самый продуктивный день,${
        data.mostProductiveDay.day
      } (${data.mostProductiveDay.productivity.toFixed(1)}%)\n`

      csv += '\nРаспределение по категориям:\n'
      csv += 'Категория,Время (ч),Процент\n'
      data.timeDistribution.forEach((item) => {
        csv += `${item.categoryName},${(
          item.totalTime /
          (60 * 60 * 1000)
        ).toFixed(2)},${item.percentage.toFixed(1)}%\n`
      })

      return csv
    }

    // JSON по умолчанию
    return JSON.stringify(
      {
        analytics: data,
        weeklyReport: report,
        generatedAt: new Date().toISOString(),
      },
      null,
      2
    )
  }

  return {
    // Данные
    analyticsData,

    // Методы
    generateAIInsights,
    generateWeeklyReport,
    exportAnalyticsData,
  }
})
