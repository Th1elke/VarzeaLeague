<script setup lang="ts">
interface TimeResumo {
  id: number
  nome: string
  sigla: string
}

interface Campeonato {
  id: number
  nome: string
  temporada: string
  formato: string
  status: string
  times: TimeResumo[]
}

interface LinhaClassificacao {
  time_id: number
  nome: string
  sigla: string
  jogos: number
  vitorias: number
  empates: number
  derrotas: number
  gols_pro: number
  gols_contra: number
  saldo_gols: number
  pontos: number
}

interface Partida {
  id: number
  time_casa_id: number
  time_visitante_id: number
  gols_casa: number | null
  gols_visitante: number | null
  data: string
  rodada: number
  status: string
}

interface LinhaArtilharia {
  jogador_id: number
  nome: string
  time: TimeResumo
  gols: number
}

const route = useRoute()
const config = useRuntimeConfig()
const id = route.params.id as string

const { data, status, error } = await useAsyncData(`campeonato-${id}`, async () => {
  const baseURL = config.public.apiBase

  const [campeonato, classificacao, partidas, artilharia] = await Promise.all([
    $fetch<Campeonato>(`/campeonatos/${id}`, { baseURL }),
    $fetch<LinhaClassificacao[]>(`/campeonatos/${id}/classificacao`, { baseURL }),
    $fetch<Partida[]>(`/campeonatos/${id}/partidas`, { baseURL }),
    $fetch<LinhaArtilharia[]>(`/campeonatos/${id}/artilharia`, { baseURL }),
  ])

  return { campeonato, classificacao, partidas, artilharia }
})

const timesPorId = computed(() => {
  const mapa = new Map<number, TimeResumo>()
  for (const time of data.value?.campeonato.times ?? []) {
    mapa.set(time.id, time)
  }
  return mapa
})

function nomeTime(timeId: number) {
  return timesPorId.value.get(timeId)?.nome ?? `Time #${timeId}`
}

function formatarData(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(
    new Date(iso),
  )
}
</script>

<template>
  <main class="mx-auto max-w-3xl px-6 py-10">
    <NuxtLink to="/" class="text-sm text-slate-400 hover:text-slate-200">&larr; Campeonatos</NuxtLink>

    <p v-if="status === 'pending'" class="mt-6 text-slate-400">Carregando...</p>

    <p v-else-if="error" class="mt-6 text-red-400">
      Não foi possível carregar este campeonato (talvez ele não exista mais).
    </p>

    <template v-else-if="data">
      <header class="mt-2 mb-8">
        <h1 class="text-2xl font-semibold">{{ data.campeonato.nome }}</h1>
        <p class="text-sm text-slate-400">
          Temporada {{ data.campeonato.temporada }} · {{ data.campeonato.status }}
        </p>
      </header>

      <section class="mb-10">
        <h2 class="mb-3 text-lg font-medium text-slate-300">Classificação</h2>

        <p v-if="!data.classificacao.length" class="text-slate-400">
          Nenhum time inscrito ainda.
        </p>

        <div v-else class="overflow-x-auto rounded-lg border border-slate-800">
          <table class="w-full min-w-[520px] text-sm">
            <thead class="bg-slate-900 text-slate-400">
              <tr>
                <th class="px-3 py-2 text-left">#</th>
                <th class="px-3 py-2 text-left">Time</th>
                <th class="px-3 py-2 text-right">P</th>
                <th class="px-3 py-2 text-right">J</th>
                <th class="px-3 py-2 text-right">V</th>
                <th class="px-3 py-2 text-right">E</th>
                <th class="px-3 py-2 text-right">D</th>
                <th class="px-3 py-2 text-right">GP</th>
                <th class="px-3 py-2 text-right">GC</th>
                <th class="px-3 py-2 text-right">SG</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(linha, index) in data.classificacao"
                :key="linha.time_id"
                class="border-t border-slate-800"
              >
                <td class="px-3 py-2 text-slate-400">{{ index + 1 }}</td>
                <td class="px-3 py-2 font-medium">{{ linha.nome }}</td>
                <td class="px-3 py-2 text-right font-semibold">{{ linha.pontos }}</td>
                <td class="px-3 py-2 text-right text-slate-300">{{ linha.jogos }}</td>
                <td class="px-3 py-2 text-right text-slate-300">{{ linha.vitorias }}</td>
                <td class="px-3 py-2 text-right text-slate-300">{{ linha.empates }}</td>
                <td class="px-3 py-2 text-right text-slate-300">{{ linha.derrotas }}</td>
                <td class="px-3 py-2 text-right text-slate-300">{{ linha.gols_pro }}</td>
                <td class="px-3 py-2 text-right text-slate-300">{{ linha.gols_contra }}</td>
                <td class="px-3 py-2 text-right text-slate-300">{{ linha.saldo_gols }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="mb-10">
        <h2 class="mb-3 text-lg font-medium text-slate-300">Jogos</h2>

        <p v-if="!data.partidas.length" class="text-slate-400">Nenhuma partida agendada.</p>

        <ul v-else class="space-y-2">
          <li
            v-for="partida in data.partidas"
            :key="partida.id"
            class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-3"
          >
            <div>
              <p class="text-xs text-slate-500">Rodada {{ partida.rodada }} · {{ formatarData(partida.data) }}</p>
              <p class="font-medium">
                {{ nomeTime(partida.time_casa_id) }}
                <span v-if="partida.status === 'ENCERRADA'">
                  {{ partida.gols_casa }} x {{ partida.gols_visitante }}
                </span>
                <span v-else class="text-slate-500">x</span>
                {{ nomeTime(partida.time_visitante_id) }}
              </p>
            </div>
            <span
              class="rounded-full px-2 py-1 text-xs"
              :class="partida.status === 'ENCERRADA' ? 'bg-emerald-900 text-emerald-300' : 'bg-slate-800 text-slate-400'"
            >
              {{ partida.status }}
            </span>
          </li>
        </ul>
      </section>

      <section>
        <h2 class="mb-3 text-lg font-medium text-slate-300">Artilharia</h2>

        <p v-if="!data.artilharia.length" class="text-slate-400">Nenhum gol registrado ainda.</p>

        <ol v-else class="space-y-2">
          <li
            v-for="(artilheiro, index) in data.artilharia"
            :key="artilheiro.jogador_id"
            class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 px-4 py-3"
          >
            <span>
              <span class="text-slate-500">{{ index + 1 }}.</span>
              {{ artilheiro.nome }}
              <span class="text-sm text-slate-400">({{ artilheiro.time.sigla }})</span>
            </span>
            <span class="font-semibold">{{ artilheiro.gols }}</span>
          </li>
        </ol>
      </section>
    </template>
  </main>
</template>
