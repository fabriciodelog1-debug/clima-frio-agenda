// Utility to convert Brazilian Real currency numbers to words (por extenso)
// Example: 450.00 -> "Quatrocentos e cinquenta reais"

const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
const dezADezenove = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

function converterCentena(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'cem';

  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;
  const partes: string[] = [];

  if (c > 0) {
    partes.push(centenas[c]);
  }

  if (d === 1) {
    partes.push(dezADezenove[u]);
  } else {
    if (d > 1) partes.push(dezenas[d]);
    if (u > 0) partes.push(unidades[u]);
  }

  return partes.join(' e ');
}

export function numberToCurrencyWords(amount: number): string {
  if (amount <= 0 || isNaN(amount)) return 'Zero reais';

  const rounded = Math.round(amount * 100) / 100;
  const inteiros = Math.floor(rounded);
  const centavos = Math.round((rounded - inteiros) * 100);

  const partesTexto: string[] = [];

  // Milhões
  const milhoes = Math.floor(inteiros / 1000000);
  const restoMilhoes = inteiros % 1000000;

  if (milhoes > 0) {
    const textoMilhoes = converterCentena(milhoes);
    partesTexto.push(`${textoMilhoes} ${milhoes === 1 ? 'milhão' : 'milhões'}`);
  }

  // Milhares
  const milhares = Math.floor(restoMilhoes / 1000);
  const restoMilhares = restoMilhoes % 1000;

  if (milhares > 0) {
    if (milhares === 1) {
      partesTexto.push('um mil');
    } else {
      const textoMilhares = converterCentena(milhares);
      partesTexto.push(`${textoMilhares} mil`);
    }
  }

  // Centenas/Dezenas/Unidades
  if (restoMilhares > 0) {
    const textoCentena = converterCentena(restoMilhares);
    if (textoCentena) partesTexto.push(textoCentena);
  }

  let textoReais = '';
  if (inteiros === 0) {
    // Apenas centavos
  } else if (inteiros === 1) {
    textoReais = partesTexto.join(' e ') + ' real';
  } else {
    textoReais = partesTexto.join(' e ') + ' reais';
  }

  let textoCentavos = '';
  if (centavos > 0) {
    const centavosTexto = converterCentena(centavos);
    textoCentavos = `${centavosTexto} ${centavos === 1 ? 'centavo' : 'centavos'}`;
  }

  let resultadoFinal = '';
  if (textoReais && textoCentavos) {
    resultadoFinal = `${textoReais} e ${textoCentavos}`;
  } else if (textoReais) {
    resultadoFinal = textoReais;
  } else if (textoCentavos) {
    resultadoFinal = textoCentavos;
  } else {
    resultadoFinal = 'Zero reais';
  }

  // Capitalize first letter
  return resultadoFinal.charAt(0).toUpperCase() + resultadoFinal.slice(1);
}
