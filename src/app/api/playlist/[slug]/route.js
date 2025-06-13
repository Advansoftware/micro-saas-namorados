import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    // Await params antes de usar suas propriedades (Next.js 15+)
    const { slug } = await params;

    // Caminho para o arquivo JSON específico do slug
    const filePath = path.join(process.cwd(), 'src', 'data', 'playlists', `${slug}.json`);

    // Verificar se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Playlist não encontrada' },
        { status: 404 }
      );
    }

    // Ler e retornar o conteúdo do arquivo
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao carregar playlist:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}