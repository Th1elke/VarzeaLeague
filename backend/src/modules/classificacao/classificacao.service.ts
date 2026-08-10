export interface TimeParticipante {
  id: number;
  nome: string;
  sigla: string;
}

export interface PartidaEncerrada {
  time_casa_id: number;
  time_visitante_id: number;
  gols_casa: number;
  gols_visitante: number;
}

export interface LinhaClassificacao {
  time_id: number;
  nome: string;
  sigla: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  gols_pro: number;
  gols_contra: number;
  saldo_gols: number;
  pontos: number;
}

/**
 * Calcula os pontos que `timeId` obteve apenas nos confrontos diretos contra
 * `adversarioId` (usado como critério de desempate). Times que nunca se
 * enfrentaram somam 0 para ambos, mantendo o critério anterior decisivo.
 */
function pontosNoConfrontoDireto(
  partidas: PartidaEncerrada[],
  timeId: number,
  adversarioId: number,
): number {
  let pontos = 0;

  for (const partida of partidas) {
    const timeEhCasa = partida.time_casa_id === timeId && partida.time_visitante_id === adversarioId;
    const timeEhVisitante = partida.time_visitante_id === timeId && partida.time_casa_id === adversarioId;

    if (!timeEhCasa && !timeEhVisitante) continue;

    const golsTime = timeEhCasa ? partida.gols_casa : partida.gols_visitante;
    const golsAdversario = timeEhCasa ? partida.gols_visitante : partida.gols_casa;

    if (golsTime > golsAdversario) pontos += 3;
    else if (golsTime === golsAdversario) pontos += 1;
  }

  return pontos;
}

export function calcularClassificacao(
  times: TimeParticipante[],
  partidasEncerradas: PartidaEncerrada[],
): LinhaClassificacao[] {
  const linhas = new Map<number, LinhaClassificacao>();

  for (const time of times) {
    linhas.set(time.id, {
      time_id: time.id,
      nome: time.nome,
      sigla: time.sigla,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      gols_pro: 0,
      gols_contra: 0,
      saldo_gols: 0,
      pontos: 0,
    });
  }

  for (const partida of partidasEncerradas) {
    aplicarResultado(linhas, partida.time_casa_id, partida.gols_casa, partida.gols_visitante);
    aplicarResultado(linhas, partida.time_visitante_id, partida.gols_visitante, partida.gols_casa);
  }

  return Array.from(linhas.values()).sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos;
    if (b.saldo_gols !== a.saldo_gols) return b.saldo_gols - a.saldo_gols;
    if (b.gols_pro !== a.gols_pro) return b.gols_pro - a.gols_pro;

    const pontosA = pontosNoConfrontoDireto(partidasEncerradas, a.time_id, b.time_id);
    const pontosB = pontosNoConfrontoDireto(partidasEncerradas, b.time_id, a.time_id);
    if (pontosB !== pontosA) return pontosB - pontosA;

    return a.nome.localeCompare(b.nome);
  });
}

export interface EstatisticaComJogador {
  jogador_id: number;
  gols: number;
  jogador: { id: number; nome: string; time: { id: number; nome: string; sigla: string } };
}

export interface LinhaArtilharia {
  jogador_id: number;
  nome: string;
  time: { id: number; nome: string; sigla: string };
  gols: number;
}

export function calcularArtilharia(estatisticas: EstatisticaComJogador[]): LinhaArtilharia[] {
  const linhas = new Map<number, LinhaArtilharia>();

  for (const estatistica of estatisticas) {
    if (estatistica.gols <= 0) continue;

    const existente = linhas.get(estatistica.jogador_id);
    if (existente) {
      existente.gols += estatistica.gols;
    } else {
      linhas.set(estatistica.jogador_id, {
        jogador_id: estatistica.jogador_id,
        nome: estatistica.jogador.nome,
        time: estatistica.jogador.time,
        gols: estatistica.gols,
      });
    }
  }

  return Array.from(linhas.values()).sort((a, b) => b.gols - a.gols || a.nome.localeCompare(b.nome));
}

function aplicarResultado(
  linhas: Map<number, LinhaClassificacao>,
  timeId: number,
  golsFeitos: number,
  golsSofridos: number,
) {
  const linha = linhas.get(timeId);
  if (!linha) return;

  linha.jogos += 1;
  linha.gols_pro += golsFeitos;
  linha.gols_contra += golsSofridos;
  linha.saldo_gols = linha.gols_pro - linha.gols_contra;

  if (golsFeitos > golsSofridos) {
    linha.vitorias += 1;
    linha.pontos += 3;
  } else if (golsFeitos === golsSofridos) {
    linha.empates += 1;
    linha.pontos += 1;
  } else {
    linha.derrotas += 1;
  }
}
