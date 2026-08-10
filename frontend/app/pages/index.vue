<script setup lang="ts">
interface Campeonato {
  id: number
  nome: string
  temporada: string
  formato: string
  status: string
}

const config = useRuntimeConfig()
const { data: campeonatos, status, error } = await useFetch<Campeonato[]>('/campeonatos', {
  baseURL: config.public.apiBase,
})
</script>

<template>
  <main class="mx-auto max-w-2xl px-6 py-10">
    <h2 class="mb-6 text-lg font-medium text-slate-300">Campeonatos</h2>

    <p v-if="status === 'pending'" class="text-slate-400">Carregando...</p>

    <p v-else-if="error" class="text-red-400">
      Não foi possível carregar os campeonatos. A API está rodando em
      {{ config.public.apiBase }}?
    </p>

    <p v-else-if="!campeonatos?.length" class="text-slate-400">
      Nenhum campeonato cadastrado ainda.
    </p>

    <ul v-else class="space-y-3">
      <li v-for="campeonato in campeonatos" :key="campeonato.id">
        <NuxtLink
          :to="`/campeonatos/${campeonato.id}`"
          class="block rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 transition-colors hover:border-slate-600 hover:bg-slate-800"
        >
          <p class="font-medium">{{ campeonato.nome }}</p>
          <p class="text-sm text-slate-400">
            Temporada {{ campeonato.temporada }} · {{ campeonato.status }}
          </p>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>
