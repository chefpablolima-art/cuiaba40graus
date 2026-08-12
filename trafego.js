const puppeteer = require('puppeteer');

// ==========================================
// CONFIGURAÇÕES DO PROJETO (META: 11.000 Acessos)
// ==========================================
const URL_BASE = 'https://cuiaba40graus.com.br';

const CATEGORIAS_E_PORTAL = [
    'https://cuiaba40graus.com.br/ultimas-noticias',
    'https://cuiaba40graus.com.br/politica-mt',
    'https://cuiaba40graus.com.br/policia',
    'https://cuiaba40graus.com.br/geral',
    'https://cuiaba40graus.com.br/cidades',
    'https://cuiaba40graus.com.br/esportes',
    'https://cuiaba40graus.com.br/entretenimento',
    'https://cuiaba40graus.com.br/economia',
    'https://cuiaba40graus.com.br/brasil',
    'https://cuiaba40graus.com.br/cultura',
    'https://cuiaba40graus.com.br/tecnologia'
];

function gerarMetaDiariaAleatoria() {
    const min = 11000;
    const max = 11500;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

let TOTAL_VISITAS_DIARIAS = gerarMetaDiariaAleatoria(); 
console.log(`[SISTEMA] Meta de tráfego ajustada para hoje: ${TOTAL_VISITAS_DIARIAS} acessos.`);

const PESOS_DEMAIS_CIDADES = {
    "Cuiabá": 35,
    "Várzea Grande": 30,
    "Chapada dos Guimarães": 15,
    "Santo Antônio do Leverger": 8,
    "Nossa Senhora do Livramento": 6,
    "Acorizal": 3,
    "Jangada": 4,
    "Rosário Oeste": 10,
    "Nobres": 10,
    "Poconé": 12,
    "Campo Verde": 5,
    "Nova Brasilândia": 4,
    "Barão de Melgaço": 5,
    "Planalto da Serra": 8,
    "Diamantino": 5,
    "Alto Paraguai": 5,
    "Nova Mutum": 5,
    "Arenápolis": 5,
    "Nortelândia": 5,
    "Denise": 5,
    "Porto Estrela": 5,
    "Cáceres": 5,
    "Reserva do Cabaçal": 5,
    "Curvelândia": 5,
    "Lambari d'Oeste": 5,
    "Rio Branco": 5,
    "Salto do Céu": 5,
    "Mirassol d'Oeste": 5,
    "Glória d'Oeste": 5,
    "Indiavaí": 5,
    "Araputanga": 5,
    "São José dos Quatro Marcos": 5,
    "Porto Esperidião": 5,
    "Jaciara": 5,
    "Juscimeira": 5,
    "Dom Aquino": 5,
    "São Pedro da Cipa": 5,
    "Primavera do Leste": 5,
    "Poxoréu": 5
};

function selecionarCidadePorPeso() {
    const pesoCuiaba = Math.random() * (55 - 48.9) + 48.9;
    const roletaMundial = Math.random() * 100;
    if (roletaMundial <= pesoCuiaba) return "Cuiabá";
    
    const cidades = Object.keys(PESOS_DEMAIS_CIDADES);
    const pesos = Object.values(PESOS_DEMAIS_CIDADES);
    const somaPesos = pesos.reduce((a, b) => a + b, 0);
    let random = Math.random() * somaPesos;
    
    for (let i = 0; i < cidades.length; i++) {
        random -= pesos[i];
        if (random <= 0) return cidades[i];
    }
    return "Várzea Grande";
}

function obterConfiguracaoFluxo() {
    const proporcaoMeta = TOTAL_VISITAS_DIARIAS / 11000;
    return { nome: "Modo Recuperação Intensa", concorrencia: Math.round(3 * proporcaoMeta), delayMinutos: 0.05 };
}

function obterRefererOrigem() {
    const roleta = Math.random() * 100;
    if (roleta <= 50) { 
        const redes = ['https://l.facebook.com/', 'https://lm.facebook.com/', 'https://instagram.com/', 'https://t.co/'];
        return { tipo: 'Social (50%)', url: redes[Math.floor(Math.random() * redes.length)] };
    } else if (roleta <= 80) { 
        const buscadores = ['https://www.google.com.br/', 'https://www.bing.com/', 'https://search.yahoo.com/'];
        return { tipo: 'Orgânico (30%)', url: buscadores[Math.floor(Math.random() * buscadores.length)] };
    } else {
        return { tipo: 'Direto (15%)', url: null };
    }
}

function obterConfigDispositivo() {
    const roleta = Math.random() * 100;
    if (roleta <= 85) {
        return {
            tipo: 'Mobile',
            userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
            viewport: { width: 393, height: 852, isMobile: true, hasTouch: true }
        };
    } else {
        return {
            tipo: 'Desktop',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            viewport: { width: 1366, height: 768, isMobile: false, hasTouch: false }
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
            headless: 'new',
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage', 
                '--disable-gpu', 
                '--ignore-certificate-errors',
                '--no-first-run',
                '--no-zygote',
                '--disable-accelerated-2d-canvas'
            ],
            ignoreHTTPSErrors: true
        });

        const page = await browser.newPage();
        await page.setUserAgent(dispositivo.userAgent);
        await page.setViewport(dispositivo.viewport);
        
        // Anti-detecção de robô
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
        });

        if (origem.url) await page.setExtraHTTPHeaders({ 'referer': origem.url });

        // Escolhe uma categoria inicial aleatória
        const urlInicial = CATEGORIAS_E_PORTAL[Math.floor(Math.random() * CATEGORIAS_E_PORTAL.length)];
        await page.goto(urlInicial, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});

        // Procura links de notícias na página para clicar e simular leitura real
        const linksMaterias = await page.evaluate(() => {
            const anchors = Array.from(document.querySelectorAll('a'));
            return anchors
                .map(a => a.href)
                .filter(href => {
                    if (!href.startsWith('https://cuiaba40graus.com.br/')) return false;
                    if (!href.includes('/noticia/')) return false;
                    if (href.includes('#') || href.includes('wp-content')) return false;
                    return true;
                });
        });

        let destinoFinal = urlInicial;
        const linksUnicos = [...new Set(linksMaterias)];

        if (linksUnicos.length > 0) {
            const indiceSorteado = Math.floor(Math.random() * Math.min(linksUnicos.length, 10));
            destinoFinal = linksUnicos[indiceSorteado];
            await page.goto(destinoFinal, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
        }

        // Simula o scroll humano para carregar todos os scripts do Google Analytics
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if(totalHeight >= scrollHeight - window.innerHeight){
                        clearInterval(timer);
                        resolve();
                    }
                }, 400);
            });
        }).catch(() => {});

        // Tempo de permanência adequado (entre 35s e 70s) para o Analytics computar
        const tempoPermanencia = Math.floor(Math.random() * (70000 - 35000 + 1) + 35000);
        await new Promise(r => setTimeout(r, tempoPermanencia));

        console.log(`[Sessão ${id}] Cidade: ${cidade} | Disp: ${dispositivo.tipo} | Fonte: ${origem.tipo} -> ${destinoFinal}`);
    } catch (e) {
        // Silencia erros na sessão
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
        await new Promise(r => setTimeout(r, i * 300)); 
        promessas.push(simularSessao(inicialId + i));
    }
    await Promise.allSettled(promessas);
}

async function iniciarSistema() {
    console.log("=== SISTEMA DE TRÁFEGO INTELIGENTE ATIVO ===");
    let visitasFeitas = 0;
    while (true) {
        try {
            const fluxo = obterConfiguracaoFluxo();
            await processarLote(fluxo.concorrencia, visitasFeitas + 1);
            visitasFeitas += fluxo.concorrencia;
            await new Promise(r => setTimeout(r, fluxo.delayMinutos * 60 * 1000));
        } catch (err) {
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});

iniciarSistema();
