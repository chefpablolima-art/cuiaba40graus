const puppeteer = require('puppeteer');

// ==========================================
// CONFIGURAÇÕES DO PROJETO (META: 11.000 Acessos)
// ==========================================
const URL_BASE = 'https://cuiaba40graus.com.br';

function gerarMetaDiariaAleatoria() {
    const min = 22000;
    const max = 23500;
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
    "Nova Brasilândia (Leste)": 4,
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

// CONFIGURAÇÃO DE FLUXO PROPORCIONAL À NOVA META (Manhã Intensificada)
function obterConfiguracaoFluxo() {
    const hora = new Date().getHours();
    const proporcaoMeta = TOTAL_VISITAS_DIARIAS / 11000;
    
    // Manhã intensificada (concorrência aumentada e delay reduzido)
    if (hora >= 7 && hora < 12) return { nome: "Fluxo Crescente (Manhã)", concorrencia: Math.round(3 * proporcaoMeta), delayMinutos: 0.15 };
    else if (hora >= 12 && hora < 18) return { nome: "Fluxo Alto (Tarde)", concorrencia: Math.round(2 * proporcaoMeta), delayMinutos: 0.12 };
    else if (hora >= 18 && hora <= 23) return { nome: "Pico Máximo (Noite)", concorrencia: Math.round(3 * proporcaoMeta), delayMinutos: 0.03 };
    else return { nome: "Madrugada (Repouso)", concorrencia: 0, delayMinutos: 2.0 }; // Pausa fora do horário das 07h-23h
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
                '--no-sandbox', 
                '--disable-setuid-sandbox', 
                '--disable-dev-shm-usage', 
                '--disable-gpu', 
                '--ignore-certificate-errors',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-accelerated-2d-canvas'
            ],
            ignoreHTTPSErrors: true
        });

        const page = await browser.newPage();
        await page.setUserAgent(dispositivo.userAgent);
        await page.setViewport(dispositivo.viewport);
        if (origem.url) await page.setExtraHTTPHeaders({ 'referer': origem.url });

        // Tratamento de erro leve na navegação para não quebrar a sessão
        await page.goto(URL_BASE, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
        console.log(`[Sessão ${id}] Cidade: ${cidade} | Disp: ${dispositivo.tipo} | Fonte: ${origem.tipo}`);
        
        await new Promise(r => setTimeout(r, 12000));
    } catch (e) {
        // Silencia erros no console para o script nunca parar
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
    console.log("=== SISTEMA DE TRÁFEGO PROFISSIONAL BLINDADO ===");
    let visitasFeitas = 0;
    while (true) {
        try {
            const hora = new Date().getHours();
            
            // Respeita a faixa de funcionamento das 07h às 23h
            if (hora < 7 || hora > 23) {
                console.log(`[SISTEMA] Fora do horário programado (${hora}h). Aguardando o expediente das 07h às 23h...`);
                await new Promise(r => setTimeout(r, 60000 * 5));
                continue;
            }

            const fluxo = obterConfiguracaoFluxo();
            await processarLote(fluxo.concorrencia, visitasFeitas + 1);
            visitasFeitas += fluxo.concorrencia;
            await new Promise(r => setTimeout(r, fluxo.delayMinutos * 60 * 1000));
        } catch (err) {
            // Captura qualquer erro global no loop para garantir que o script continue rodando infindavelmente
            await new Promise(r => setTimeout(r, 5000));
        }
    }
}

// Tratamento de exceções globais para evitar crash do Node.js
process.on('uncaughtException', () => {});
process.on('unhandledRejection', () => {});

iniciarSistema();