export async function POST() {
  return Response.json({
    error: 'La pujada d\'imatges està deshabilitada. Utilitza el botó "+ Inserir imatge" a l\'editor de text per enganxar una URL externa.',
  }, { status: 400 })
}
