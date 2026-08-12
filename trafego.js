const puppeteer = require('puppeteer');

// ==========================================
// CONFIGURAÇÕES DO PROJETO (META: 11.000 Acessos)
// ==========================================
const URL_BASE = 'https://cuiaba40graus.com.br';

// Lista de editorias com pesos ponderados
const CATEGORIAS_COM_PESOS = [
    { url: 'https://cuiaba40graus.com.br/politica-mt', peso: 35 },  
    { url: 'https://cuiaba40graus.com.br/policia', peso: 25 },     
    { url: 'https://cuiaba40graus.com.br/geral', peso: 8 },         
    { url: 'https://cuiaba40graus.com.br/cidades', peso: 8 },
    { url: 'https://cuiaba40graus.com.br/esportes', peso: 6 },
    { url: 'https://cuiaba40graus.com.br/entretenimento', peso: 5 },
    { url: 'https://cuiaba40graus.com.br/economia', peso: 5 },
    { url: 'https://cuiaba40graus.com.br/brasil', peso: 3 },
    { url: 'https://cuiaba40graus.com.br/cultura', peso: 3 },
    { url: 'https://cuiaba40graus.com.br/tecnologia', peso: 2 }
];

function selecionarCategoriaPorPeso() {
    const totalPesos = CATEGORIAS_COM_PESOS.reduce((soma, cat) => soma + cat.peso, 0);
    let random = Math.random() * totalPesos;
    for (let i = 0; i < CATEGORIAS_COM_PESOS.length; i++) {
        random -= CATEGORIAS_COM_PESOS[i].peso;
        if (random <= 0) {
            return CATEGORIAS_COM_PESOS[i].url;
        }
    }
    return CATEGORIAS_COM_PESOS[0].url;
}

function gerarMetaDiariaAleatoria() {
    const min = 11000;
    const max = 11500;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let TOTAL_VISITAS_DIARIAS = gerarMetaDiariaAleatoria(); 
console.log(`[SISTEMA] Meta de tráfego ajustada para hoje: ${TOTAL_VISITAS_DIARIAS} acessos.`);

// APENAS CIDADES DE MATO GROSSO
const PESOS_DEMAIS_CIDADES = {
    "Cuiabá": 40, "Várzea Grande": 25, "Chapada dos Guimarães": 10, "Santo Antônio do Leverger": 5,
    "Nossa Senhora do Livramento": 4, "Acorizal": 2, "Jangada": 3, "Rosário Oeste": 5, "Nobres": 5,
    "Poconé": 6, "Campo Verde": 4, "Primavera do Leste": 5, "Cáceres": 5, "Rondonópolis": 5, "Sinop": 5
};

function selecionarCidadePorPeso() {
    const cidades = Object.keys(PESOS_DEMAIS_CIDADES);
    const pesos = Object.values(PESOS_DEMAIS_CIDADES);
    const somaPesos = pesos.reduce((a, b) => a + b, 0);
    let random = Math.random() * somaPesos;
    for (let i = 0; i < cidades.length; i++) {
        random -= pesos[i];
        if (random <= 0) return cidades[i];
    }
    return "Cuiabá";
}

function obterConfiguracaoFluxo() {
    const hora = new Date().getHours();
    const proporcaoMeta = TOTAL_VISITAS_DIARIAS / 11000;
    
    if (hora >= 7 && hora < 12) return { nome: "Fluxo Crescente (Manhã)", concorrencia: Math.round(3 * proporcaoMeta), delayMinutos: 0.15 };
    else if (hora >= 12 && hora < 18) return { nome: "Fluxo Alto (Tarde)", concorrencia: Math.round(2 * proporcaoMeta), delayMinutos: 0.12 };
    else if (hora >= 18 && hora <= 23) return { nome: "Pico Máximo (Noite)", concorrencia: Math.round(3 * proporcaoMeta), delayMinutos: 0.03 };
    else return { nome: "Madrugada Contínua", concorrencia: Math.round(1 * proporcaoMeta), delayMinutos: 0.3 };
}

function obterRefererOrigem() {
    const roleta = Math.random() * 100;
    if (roleta <= 50) { 
        const redes = ['https://l.facebook.com/', 'https://lm.facebook.com/', 'https://instagram.com/', 'https://t.co/'];
        return { tipo: 'Social (50%)', url: redes[Math.floor(Math.random() * redes.length)] };
    } else if (roleta <= 80) { 
        const buscadores = ['https://www.google.com.br/', 'https://www.bing.com/', 'https://search.yahoo.com/'];
        return { tipo: 'Orgânico (30%)', url: buscadores[Math.floor(Math.random() * buscadores.length)] };
    } else return { tipo: 'Direto (15%)', url: null };
}

function obterConfigDispositivo() {
    const roleta = Math.random() * 100;
    if (roleta <= 85) {
        return {
            tipo: 'Mobile',
            userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            viewport: { width: 390, height: 844, isMobile: true, hasTouch: true }
        };
    } else {
        return {
            tipo: 'Desktop',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
            viewport: { width: 1920, height: 1080, isMobile: false, hasTouch: false }
        };
    }
}

async function simularSessao(id) {
    const cidade = selecionarCidadePorPeso();
    const dispositivo = obterConfigDispositivo();
    const origem = obterRefererOrigem();

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', 
                '--disable-gpu', '--ignore-certificate-errors', '--no-first-run',
                '--no-zygote', '--single-process', '--disable-accelerated-2d-canvas'
            ],
            ignoreHTTPSErrors: true
        });

        const page = await browser.newPage();
        await page.setUserAgent(dispositivo.userAgent);
        await page.setViewport(dispositivo.viewport);
        if (origem.url) await page.setExtraHTTPHeaders({ 'referer': origem.url });

        const urlCategoria = selecionarCategoriaPorPeso();
        await page.goto(urlCategoria, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});

        const linksMaterias = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors
                .map(a => a.href)
                .filter(href => {
                    if (!href.startsWith('https://cuiaba40graus.com.br/')) return false;
                    if (href === 'https://cuiaba40graus.com.br/') return false;
                    if (href.includes('#') || href.includes('wp-content') || href.includes('wp-json')) return false;
                    
                    const termosIgnorados = [
                        '/politica-mt', '/policia', '/geral', '/cidades', '/esportes', 
                        '/entretenimento', '/economia', '/brasil', '/cultura', '/tecnologia',
                        '/pagina/', '/autor/', '/tag/', '/categoria/'
                    ];

                    for (let termo of termosIgnorados) {
                        if (href.endsWith(termo) || href.endsWith(termo + '/')) return false;
                    }
                    return true;
                });
        });

        let destinoFinal = urlCategoria;
        const linksUnicos = [...new Set(linksMaterias)];
        
        if (linksUnicos.length > 0) {
            const indiceSorteado = Math.floor(Math.random() * Math.min(linksUnicos.length, 10));
            destinoFinal = linksUnicos[indiceSorteado];
            await page.goto(destinoFinal, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
        }

        console.log(`[Sessão ${id}] Acessou Matéria: ${destinoFinal} | Cidade: ${cidade} | Disp: ${dispositivo.tipo} | Fonte: ${origem.tipo}`);
        
        await new Promise(r => setTimeout(r, 15000));
    } catch (e) {
        // Silencia erros
    } finally {
        if (browser) {
            await browser.close().catch(() => {});
        }
    }
}

async function processarLote(quantidade, inicialId) {
    if (quantidade <= 0) return;
    const promessas = [];
    for (let i = 0; i < quantidade; i++) {
        await new Promise(r => setTimeout(r, i * 350)); 
        promessas.push(simularSessao(inicialId + i));
    }
    await Promise.allSettled(promessas);
}

async function iniciarSistema() {
    console.log("=== SISTEMA DE TRÁFEGO 24H FOCADO EM MATÉRIAS E MT ===");
    let visitasFeitas = 0;
    while (true) {
        try {
            const fluxo = obterConfiguracaoFluxo();
            await processarLote(fluxo.concorrencia, visitasFeitas + 1);
            visitasFeitas += fluxo.concorrencia;
            await new Promise(r => setTimeout(r, fluxo.delayMinutos * 60 * 1000));
        } catch (err) {
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});

iniciarSistema();