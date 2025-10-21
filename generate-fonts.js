// generate-fonts.js
const fs = require('fs');
const path = require('path');

// 1. Defina os caminhos
const fontsDir = path.join(__dirname, 'assets', 'fonts');
const outputDir = path.join(__dirname, 'src', 'generated');
const outputFile = path.join(outputDir, 'fonts.ts');

console.log('Iniciando a geração da lista de fontes...');

try {
  // 2. Ler todos os arquivos do diretório de fontes
  const fontFiles = fs.readdirSync(fontsDir);

  // 3. Filtrar para incluir apenas arquivos .ttf e .otf
  const filteredFonts = fontFiles.filter(
    file =>
      file.toLowerCase().endsWith('.ttf') ||
      file.toLowerCase().endsWith('.otf'),
  );

  if (filteredFonts.length === 0) {
    console.warn(
      'Nenhum arquivo de fonte (.ttf ou .otf) encontrado em assets/fonts.',
    );
    return;
  }

  // 4. Mapear os nomes dos arquivos para o formato { name, postscriptName }
  const fontData = filteredFonts.map(file => {
    // postscriptName é o nome do arquivo sem a extensão
    const postscriptName = path.parse(file).name;

    // Um 'name' mais amigável: remove hífens e a palavra "Regular"
    const name = postscriptName
      .replace(/-/g, ' ') // Substitui hífens por espaços
      .replace(/Regular$/i, '') // Remove "Regular" do final, se houver
      .trim(); // Remove espaços extras

    return { name, postscriptName };
  });

  // Adiciona a fonte padrão do sistema no início da lista
  fontData.unshift({ name: 'Padrão', postscriptName: 'System' });

  // 5. Criar o conteúdo do arquivo TypeScript
  const fileContent = `// ATENÇÃO: Este arquivo foi gerado automaticamente. Não edite manualmente.
// Rode \`npm run generate-fonts\` para atualizar.

export interface FontOption {
  name: string;
  postscriptName: string;
}

export const AVAILABLE_FONTS: FontOption[] = ${JSON.stringify(
    fontData,
    null,
    2,
  )};
`;

  // 6. Garantir que o diretório de saída exista
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // 7. Escrever o arquivo final
  fs.writeFileSync(outputFile, fileContent);

  console.log(
    `✅ Sucesso! ${fontData.length} fontes foram salvas em ${outputFile}`,
  );
} catch (error) {
  console.error('❌ Erro ao gerar a lista de fontes:');
  console.error(error);
}
