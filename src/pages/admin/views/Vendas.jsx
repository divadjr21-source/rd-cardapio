import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../../context/useApp';

function formatarData(data) {
  return new Date(data).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatarMoeda(valor) {
  return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
}

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

function primeiroDiaMes() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

const STATUS_LABEL = {
  recebido: { texto: 'Recebido', cor: 'bg-amber-50 text-amber-700' },
  aceito: { texto: 'Aceito', cor: 'bg-blue-50 text-blue-700' },
  entregue: { texto: 'Entregue', cor: 'bg-green-50 text-green-700' },
  cancelado: { texto: 'Cancelado', cor: 'bg-red-50 text-red-700' },
};

export default function Vendas({ restauranteId }) {
  const { listarPedidos } = useApp();
  const [periodoInicio, setPeriodoInicio] = useState(primeiroDiaMes());
  const [periodoFim, setPeriodoFim] = useState(hoje());
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ignorar = false;
    async function carregar() {
      if (!restauranteId) return;
      setCarregando(true);
      try {
        const data = await listarPedidos({
          restauranteId,
          inicio: periodoInicio ? `${periodoInicio}T00:00:00` : null,
          fim: periodoFim ? `${periodoFim}T23:59:59` : null,
        });
        if (!ignorar) setPedidos(data);
      } catch (err) {
        console.error('Erro ao carregar pedidos:', err);
      } finally {
        if (!ignorar) setCarregando(false);
      }
    }
    carregar();
    return () => { ignorar = true; };
  }, [restauranteId, periodoInicio, periodoFim, listarPedidos]);

  const resumo = useMemo(() => {
    const total = pedidos.reduce((acc, p) => acc + Number(p.total), 0);
    const entregues = pedidos.filter((p) => p.status === 'entregue').length;
    return {
      total,
      quantidade: pedidos.length,
      ticketMedio: pedidos.length ? total / pedidos.length : 0,
      entregues,
    };
  }, [pedidos]);

  const porDia = useMemo(() => {
    const mapa = {};
    pedidos.forEach((p) => {
      const dia = new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      mapa[dia] = (mapa[dia] || 0) + Number(p.total);
    });
    const entradas = Object.entries(mapa).slice(-14);
    const max = Math.max(1, ...entradas.map(([, v]) => v));
    return entradas.map(([dia, valor]) => ({ dia, valor, pct: Math.round((valor / max) * 100) }));
  }, [pedidos]);

  if (!restauranteId) {
    return <p className="text-muted text-sm">Selecione uma loja para ver os relatórios de vendas.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-muted mb-1 block">De</label>
          <input
            type="date"
            value={periodoInicio}
            onChange={(e) => setPeriodoInicio(e.target.value)}
            className="px-3 py-2 bg-white border border-border rounded-xl text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-muted mb-1 block">Até</label>
          <input
            type="date"
            value={periodoFim}
            onChange={(e) => setPeriodoFim(e.target.value)}
            className="px-3 py-2 bg-white border border-border rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Destaque principal: faturamento do período */}
      <div className="bg-dark text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <p className="text-xs text-white/50 mb-2">Faturamento no período</p>
          <p className="text-4xl sm:text-5xl font-bold tracking-tight">{formatarMoeda(resumo.total)}</p>
        </div>
        <div className="flex gap-8">
          <div>
            <p className="text-2xl font-bold">{resumo.quantidade}</p>
            <p className="text-xs text-white/50">pedidos</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{formatarMoeda(resumo.ticketMedio)}</p>
            <p className="text-xs text-white/50">ticket médio</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{resumo.entregues}</p>
            <p className="text-xs text-white/50">entregues</p>
          </div>
        </div>
      </div>

      {/* Vendas por dia */}
      {porDia.length > 0 && (
        <div className="bg-white rounded-2xl border border-border p-6">
          <p className="text-sm font-semibold text-dark mb-4">Vendas por dia</p>
          <div className="flex items-end gap-2 h-32">
            {porDia.map((d) => (
              <div key={d.dia} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="w-full flex items-end justify-center h-24">
                  <div
                    className="w-full max-w-[28px] bg-primary/85 rounded-t-md group-hover:bg-primary transition-colors"
                    style={{ height: `${Math.max(4, d.pct)}%` }}
                    title={formatarMoeda(d.valor)}
                  />
                </div>
                <span className="text-[10px] text-muted">{d.dia}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de pedidos */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <p className="text-sm font-semibold text-dark">Pedidos do período</p>
        </div>
        {carregando ? (
          <div className="p-6 text-sm text-muted">Carregando pedidos...</div>
        ) : pedidos.length === 0 ? (
          <div className="p-6 text-sm text-muted">Nenhum pedido encontrado nesse período.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="px-6 py-3 font-medium">Cliente</th>
                  <th className="px-6 py-3 font-medium">Tipo</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((p) => {
                  const status = STATUS_LABEL[p.status] || STATUS_LABEL.recebido;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-bg/60">
                      <td className="px-6 py-3">
                        <p className="font-medium text-dark">{p.cliente_nome}</p>
                        <p className="text-xs text-muted">{p.cliente_telefone}</p>
                      </td>
                      <td className="px-6 py-3 text-muted">
                        {p.tipo_pedido === 'mesa' ? `Mesa ${p.numero_mesa || ''}` : 'Delivery'}
                      </td>
                      <td className="px-6 py-3 text-muted">{formatarData(p.created_at)}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.cor}`}>
                          {status.texto}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-semibold text-dark">{formatarMoeda(p.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
