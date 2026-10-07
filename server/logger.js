function escrever(nivel, mensagem) {
  const linha = `${new Date().toISOString()} ${nivel.padEnd(5)} ${mensagem}\n`;
  (nivel === 'ERROR' ? process.stderr : process.stdout).write(linha);
}

export const logger = {
  info: (mensagem) => escrever('INFO', mensagem),
  warn: (mensagem) => escrever('WARN', mensagem),
  error: (mensagem) => escrever('ERROR', mensagem),
};
