# Product

<!-- impeccable:product-schema 1 -->

> Registro inferido do briefing (sessão sem canal de pergunta ao usuário). Tudo marcado como **[inferido]** foi decidido a partir do briefing escrito e deve ser confirmado pelo George.

## Platform

web

## Stack

delegated: Vite + HTML/CSS/JS sem framework, GSAP 3 (ScrollTrigger, SplitText) + Lenis. O briefing sugeriu essa stack; página única não precisa de React.

## Users

- **Quem decide (portfólio):** donos de negócio local (cafés, padarias, restaurantes, lojas) que o George prospecta. Precisam ver em segundos que ele entrega um site "de agência" que vende. [inferido]
- **Visitante fictício do site:** morador de bairro premium que quer saber o que sai do forno hoje, a que horas, e pedir ou reservar pelo WhatsApp. Usa o celular, muitas vezes de manhã cedo. [inferido]

## Product Purpose

Peça de portfólio nº 3 do plano `negocios/portfolio/plano-portfolio.md`: landing page de um negócio fictício (cafeteria + padaria artesanal) que mostra o nível máximo de motion, direção de arte e acabamento técnico (Lighthouse ≥ 90, acessível, responsivo). Sucesso = um prospect assiste à demo no celular do George e pede um orçamento.

## Positioning

Marca fictícia **Sereno Forno & Café** (nome criado para o projeto). Mecanismo próprio: pão de fermentação natural de 36 horas, feito de madrugada, com **fornadas em hora marcada** (o cliente sabe o que sai do forno e quando) e ingredientes do Nordeste (rapadura, queijo coalho, manteiga da terra, café do Maciço de Baturité). [inferido]

## Operating Context

- Página única, mobile-first; a conversão é sempre via WhatsApp (`https://wa.me/` sem número real).
- Mostrada no celular, em vídeo (demo) e publicada como peça de portfólio.

## Capabilities and Constraints

- Marca fictícia, fora da área da saúde.
- Fotos só de banco com licença comercial (Unsplash/Pexels), creditadas em `CREDITOS.md`. Nenhuma foto de pessoa em depoimento.
- Vídeo próprio renderizado com HyperFrames (estúdio criativo do George).
- Não publicar, não fazer push.

## Brand Commitments

- Rodapé deixa claro: "Projeto conceitual / peça de portfólio". Endereço, preços e depoimentos rotulados como fictícios.
- Sem o nome do George em destaque (ele vai atuar sob marca).
- Copy em PT-BR, tom de vizinho que entende de pão: direto, caloroso, específico, sem clichê de "artesanal com amor".

## Evidence on Hand

Nenhuma prova real: não existem clientes, prêmios, números de vendas ou depoimentos reais. Depoimentos e preços são fictícios e rotulados como tal.

## Product Principles

1. Mostrar o forno trabalhando (horários, processo, ingredientes) em vez de adjetivos.
2. Um gesto de motion memorável por seção, sempre com motivo; reduzir movimento quando o sistema pedir.
3. WhatsApp a um toque em qualquer ponto da página.
4. Velocidade é parte do acabamento: a página tem de abrir rápido num celular comum.

## Accessibility & Inclusion

WCAG 2.2 AA: contraste, foco visível, navegação por teclado, `prefers-reduced-motion` respeitado em todo o motion.
