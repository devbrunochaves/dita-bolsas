import { useMemo, useState } from 'react'
import {
  Bot, Check, ChevronDown, Clock3, FileImage, MessageCircle,
  MoreVertical, Paperclip, Search, Send, UserRound, UsersRound,
} from 'lucide-react'
import './Atendimento.css'

const CONTATOS = [
  {
    id: 1, nome: 'Mariana Costa', telefone: '(11) 98765-4321', iniciais: 'MC',
    cor: 'rosa', previa: 'Preciso de 30 bolsinhas para...', horario: '10:42',
    naoLidas: 2, status: 'aguardando', produto: 'Bolsinha personalizada',
    quantidade: 30, data: '15/08/2026', tema: 'Jardim Encantado',
    cep: '01310-100', arte: 'referencia-jardim.jpg',
    etiquetas: ['Novo cliente', 'Aniversário', 'Prioridade média'],
    nota: 'Cliente pediu cores suaves e acabamento com laço.',
  },
  {
    id: 2, nome: 'Rafael Mendes', telefone: '(11) 99821-7740', iniciais: 'RM',
    cor: 'azul', previa: 'A arte já está pronta, vou enviar.', horario: '10:18',
    naoLidas: 1, status: 'robo', produto: 'Caneca de porcelana',
    quantidade: 20, data: '28/08/2026', tema: 'Equipe comercial',
    cep: '04538-132', arte: 'logo-equipe-comercial.pdf',
    etiquetas: ['Empresa', 'Canecas'],
    nota: 'Aguardando o arquivo em alta resolução.',
  },
  {
    id: 3, nome: 'Escola Mundo Feliz', telefone: '(11) 3321-9088', iniciais: 'EM',
    cor: 'amarelo', previa: 'Gostaria de repetir o último pedido.', horario: 'Ontem',
    naoLidas: 0, status: 'humano', produto: 'Mochila escolar',
    quantidade: 80, data: '10/01/2027', tema: 'Volta às aulas',
    cep: '05005-000', arte: 'modelo-mochila-2026.png',
    etiquetas: ['Cliente recorrente', 'Escola', 'Pedido grande'],
    nota: 'Repetir as medidas e o tecido do pedido de novembro.',
  },
  {
    id: 4, nome: 'Camila Nogueira', telefone: '(11) 97754-2031', iniciais: 'CN',
    cor: 'lilas', previa: 'Vocês fazem DTF em camiseta?', horario: 'Ontem',
    naoLidas: 0, status: 'robo', produto: 'Camiseta com DTF',
    quantidade: 12, data: '05/09/2026', tema: 'Despedida de turma',
    cep: '04101-300', arte: 'Ainda não enviada',
    etiquetas: ['Novo cliente', 'DTF têxtil'],
    nota: 'Confirmar cores e tamanhos das camisetas.',
  },
]

const MENSAGENS_INICIAIS = {
  1: [
    { de: 'cliente', texto: 'Olá! Gostaria de saber o valor de uma bolsinha personalizada.', hora: '10:36' },
    { de: 'robo', texto: 'Olá, Mariana! 😊 Seja muito bem-vinda à Dita Bolsas. Vou fazer algumas perguntas rápidas para entendermos seu pedido. Quantas bolsinhas você precisa?', hora: '10:36' },
    { de: 'cliente', texto: 'Preciso de 30 para o aniversário da minha filha.', hora: '10:38' },
    { de: 'robo', texto: 'Que legal! Qual é o tema da festa e para qual data você precisa do pedido?', hora: '10:38' },
    { de: 'cliente', texto: 'O tema é Jardim Encantado. A festa será dia 15 de agosto. Tenho uma imagem de referência.', hora: '10:41' },
    { de: 'robo', texto: 'Perfeito! Pode enviar a referência por aqui. Para completar, qual é o CEP de entrega?', hora: '10:41' },
    { de: 'cliente', texto: '01310-100', hora: '10:42' },
  ],
  2: [
    { de: 'cliente', texto: 'Bom dia! Preciso de 20 canecas para a equipe comercial.', hora: '10:12' },
    { de: 'robo', texto: 'Bom dia, Rafael! Será um prazer ajudar. Você precisa das canecas para qual data?', hora: '10:13' },
    { de: 'cliente', texto: 'Para 28 de agosto. A arte já está pronta, vou enviar.', hora: '10:18' },
    { de: 'robo', texto: 'Perfeito! Pode enviar o arquivo. Se possível, prefira PDF, PNG ou imagem em alta resolução.', hora: '10:18' },
  ],
  3: [
    { de: 'cliente', texto: 'Olá! Gostaria de repetir o último pedido de mochilas da escola.', hora: '16:04' },
    { de: 'robo', texto: 'Olá! Que bom falar novamente com a Escola Mundo Feliz. Encontrei o pedido anterior. Quantas unidades vocês precisam desta vez?', hora: '16:04' },
    { de: 'cliente', texto: 'Serão 80 unidades, iguais às últimas. Precisamos para a volta às aulas.', hora: '16:08' },
    { de: 'robo', texto: 'Ótimo! Registrei 80 mochilas para 10 de janeiro. Vou encaminhar o pedido para nossa equipe confirmar valores e prazo.', hora: '16:09' },
    { de: 'humano', texto: 'Boa tarde! Já estou conferindo o pedido anterior para preparar o orçamento atualizado.', hora: '16:14' },
  ],
  4: [
    { de: 'cliente', texto: 'Oi! Vocês fazem DTF em camiseta?', hora: '15:31' },
    { de: 'robo', texto: 'Olá, Camila! Fazemos sim 😊 Quantas camisetas você precisa personalizar?', hora: '15:31' },
    { de: 'cliente', texto: 'São 12 camisetas para uma despedida de turma.', hora: '15:35' },
    { de: 'robo', texto: 'Legal! Você já tem a arte e sabe os tamanhos das camisetas?', hora: '15:35' },
  ],
}

const STATUS = {
  aguardando: 'Aguardando humano',
  robo: 'Robô atendendo',
  humano: 'Em atendimento',
}

export default function Atendimento() {
  const [selecionadoId, setSelecionadoId] = useState(1)
  const [filtro, setFiltro] = useState('todas')
  const [busca, setBusca] = useState('')
  const [mensagens, setMensagens] = useState(MENSAGENS_INICIAIS)
  const [rascunho, setRascunho] = useState('')
  const [assumidos, setAssumidos] = useState(() => new Set([3]))

  const contato = CONTATOS.find(item => item.id === selecionadoId) || CONTATOS[0]
  const conversaAssumida = assumidos.has(contato.id)

  const contatosFiltrados = useMemo(() => CONTATOS.filter(item => {
    const correspondeStatus = filtro === 'todas'
      || (filtro === 'aguardando' && item.status === 'aguardando')
      || (filtro === 'robo' && item.status === 'robo')
    const termo = `${item.nome} ${item.telefone} ${item.previa}`.toLowerCase()
    return correspondeStatus && termo.includes(busca.toLowerCase())
  }), [busca, filtro])

  function enviar() {
    const texto = rascunho.trim()
    if (!texto || !conversaAssumida) return
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setMensagens(atuais => ({
      ...atuais,
      [contato.id]: [...(atuais[contato.id] || []), { de: 'humano', texto, hora }],
    }))
    setRascunho('')
  }

  function assumirAtendimento() {
    setAssumidos(atuais => new Set([...atuais, contato.id]))
  }

  return (
    <div className="atendimento-page">
      <section className="atendimento-topo">
        <div>
          <p className="atendimento-kicker">Central de relacionamento</p>
          <h2>Atendimento</h2>
          <p>Receba clientes, acompanhe a triagem e transforme conversas em pedidos.</p>
        </div>
        <button className="atendimento-nova"><MessageCircle size={17} /> Nova conversa</button>
      </section>

      <section className="atendimento-metricas">
        <article><span className="metrica-icone rosa"><MessageCircle size={18} /></span><div><small>Conversas hoje</small><strong>24</strong><em>↑ 12% vs. ontem</em></div></article>
        <article><span className="metrica-icone amarelo"><Clock3 size={18} /></span><div><small>Aguardando atendimento</small><strong>3</strong><em>Tempo médio: 4 min</em></div></article>
        <article><span className="metrica-icone verde"><Check size={18} /></span><div><small>Resolvidas hoje</small><strong>18</strong><em>↑ 8% vs. ontem</em></div></article>
        <article><span className="metrica-icone lilas"><Bot size={18} /></span><div><small>Com o robô</small><strong>6</strong><em>Triagem em andamento</em></div></article>
      </section>

      <section className="atendimento-mesa">
        <aside className="atendimento-lista">
          <div className="atendimento-filtros">
            <button className={filtro === 'todas' ? 'ativo' : ''} onClick={() => setFiltro('todas')}>Todas <b>24</b></button>
            <button className={filtro === 'aguardando' ? 'ativo' : ''} onClick={() => setFiltro('aguardando')}>Aguardando <b>3</b></button>
            <button className={filtro === 'robo' ? 'ativo' : ''} onClick={() => setFiltro('robo')}>Com o robô <b>6</b></button>
          </div>
          <label className="atendimento-busca"><Search size={15} /><input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar conversa..." /></label>
          <div className="atendimento-contatos">
            {contatosFiltrados.map(item => (
              <button key={item.id} className={`atendimento-contato ${item.id === selecionadoId ? 'selecionado' : ''}`} onClick={() => setSelecionadoId(item.id)}>
                <span className={`atendimento-avatar ${item.cor}`}>{item.iniciais}</span>
                <span className="atendimento-contato-texto">
                  <span><strong>{item.nome}</strong><time>{item.horario}</time></span>
                  <small>{item.previa}</small>
                  <em className={`situacao ${item.status}`}>{STATUS[item.status]}</em>
                </span>
                {item.naoLidas > 0 && <b className="atendimento-nao-lidas">{item.naoLidas}</b>}
              </button>
            ))}
          </div>
        </aside>

        <article className="atendimento-chat">
          <header>
            <span className={`atendimento-avatar ${contato.cor}`}>{contato.iniciais}</span>
            <div><strong>{contato.nome}</strong><small><i /> {contato.telefone}</small></div>
            <button aria-label="Buscar na conversa"><Search size={17} /></button>
            <button aria-label="Mais opções"><MoreVertical size={17} /></button>
          </header>
          <div className="atendimento-mensagens">
            <div className="atendimento-dia"><span>Hoje</span></div>
            {(mensagens[contato.id] || []).map((mensagem, index) => (
              <div key={`${contato.id}-${index}`} className={`atendimento-mensagem ${mensagem.de}`}>
                {mensagem.de === 'robo' && <span className="atendimento-robo"><Bot size={13} /></span>}
                <div>
                  {mensagem.de === 'robo' && <strong>Assistente Dita</strong>}
                  <p>{mensagem.texto}</p>
                  <time>{mensagem.hora}{mensagem.de !== 'cliente' && ' ✓✓'}</time>
                </div>
              </div>
            ))}
            {contato.status === 'aguardando' && !conversaAssumida && (
              <div className="atendimento-triagem"><Bot size={19} /><div><strong>Triagem concluída pelo assistente</strong><p>As informações principais foram coletadas. O cliente está aguardando atendimento humano.</p></div></div>
            )}
          </div>
          <footer>
            {!conversaAssumida ? (
              <button className="atendimento-assumir" onClick={assumirAtendimento}><UserRound size={16} /> Assumir atendimento</button>
            ) : (
              <>
                <button className="atendimento-anexo" aria-label="Anexar arquivo"><Paperclip size={18} /></button>
                <textarea value={rascunho} onChange={e => setRascunho(e.target.value)} onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar() }
                }} placeholder="Digite uma mensagem..." />
                <button className="atendimento-enviar" onClick={enviar} disabled={!rascunho.trim()} aria-label="Enviar mensagem"><Send size={18} /></button>
              </>
            )}
          </footer>
        </article>

        <aside className="atendimento-detalhes">
          <header><strong>Detalhes do cliente</strong><ChevronDown size={17} /></header>
          <section className="atendimento-cliente">
            <span className={`atendimento-avatar grande ${contato.cor}`}>{contato.iniciais}</span>
            <strong>{contato.nome}</strong><small>{contato.telefone}</small>
            <div><button><MessageCircle size={16} /><span>Mensagem</span></button><button><UsersRound size={16} /><span>Cliente</span></button><button><MoreVertical size={16} /><span>Mais</span></button></div>
          </section>
          <section className="atendimento-resumo">
            <div className="detalhe-titulo"><strong>Resumo do pedido</strong><button>Editar</button></div>
            <dl>
              <div><dt>Produto</dt><dd>{contato.produto}</dd></div>
              <div><dt>Quantidade</dt><dd>{contato.quantidade} unidades</dd></div>
              <div><dt>Data necessária</dt><dd>{contato.data}</dd></div>
              <div><dt>Tema</dt><dd>{contato.tema}</dd></div>
              <div><dt>CEP</dt><dd>{contato.cep}</dd></div>
              <div><dt>Arte</dt><dd><span className="detalhe-arquivo"><FileImage size={12} />{contato.arte}</span></dd></div>
            </dl>
          </section>
          <section className="atendimento-etiquetas">
            <div className="detalhe-titulo"><strong>Etiquetas</strong><button>＋</button></div>
            <div>{contato.etiquetas.map(etiqueta => <span key={etiqueta}>{etiqueta}</span>)}</div>
          </section>
          <section className="atendimento-notas">
            <div className="detalhe-titulo"><strong>Anotações internas</strong><button>Adicionar</button></div>
            <p>{contato.nota}</p>
          </section>
        </aside>
      </section>
    </div>
  )
}
