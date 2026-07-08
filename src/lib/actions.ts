'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

async function checkAuth() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('No autoritzat')
}

export async function getIssues() {
  return prisma.issue.findMany({
    orderBy: { number: 'desc' },
    include: { sections: { orderBy: { order: 'asc' } } },
  })
}

export async function getPublishedIssues() {
  return prisma.issue.findMany({
    where: { published: true },
    orderBy: { number: 'desc' },
    include: { sections: { orderBy: { order: 'asc' } } },
  })
}

export async function getIssue(id: string) {
  return prisma.issue.findUnique({
    where: { id },
    include: { sections: { orderBy: { order: 'asc' } } },
  })
}

export async function getLatestIssue() {
  return prisma.issue.findFirst({
    where: { published: true },
    orderBy: { number: 'desc' },
    include: { sections: { orderBy: { order: 'asc' } } },
  })
}

export async function createIssue(data: { number: number; title: string; date: string }) {
  await checkAuth()
  const issue = await prisma.issue.create({
    data: {
      number: data.number,
      title: data.title,
      date: new Date(data.date),
    },
  })
  revalidatePath('/admin')
  revalidatePath('/')
  return issue
}

export async function updateIssue(id: string, data: { title?: string; number?: number; date?: string; published?: boolean }) {
  await checkAuth()
  const issue = await prisma.issue.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.number !== undefined && { number: data.number }),
      ...(data.date !== undefined && { date: new Date(data.date) }),
      ...(data.published !== undefined && { published: data.published }),
    },
  })
  revalidatePath('/admin')
  revalidatePath('/')
  return issue
}

export async function deleteIssue(id: string) {
  await checkAuth()
  await prisma.issue.delete({ where: { id } })
  revalidatePath('/admin')
  revalidatePath('/')
}

export async function createSection(data: {
  issueId: string
  type: string
  order: number
  title: string
  content: string
  backgroundImage?: string
}) {
  await checkAuth()
  const section = await prisma.section.create({ data })
  revalidatePath('/admin')
  revalidatePath(`/`)
  return section
}

export async function updateSection(id: string, data: {
  title?: string
  content?: string
  backgroundImage?: string
  order?: number
  type?: string
}) {
  await checkAuth()
  const section = await prisma.section.update({ where: { id }, data })
  revalidatePath('/admin')
  revalidatePath(`/`)
  return section
}

export async function deleteSection(id: string) {
  await checkAuth()
  await prisma.section.delete({ where: { id } })
  revalidatePath('/admin')
}
