import { parseBooks } from '../domain';
import { cachedBooks, cacheBooks } from './database';

/** Explicit searches only, limited payload, timeout and persistent offline fallback. */
export async function searchBooks(term: string) {
  const query = term.trim().toLowerCase();
  if (query.length < 2 || query.length > 100)
    throw new Error('Digite entre 2 e 100 caracteres para buscar.');
  const cached = await cachedBooks(query);
  if (cached && Date.now() - Date.parse(cached.updated) < 86400000)
    return { ...cached, offline: false, cached: true };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&lang=pt&limit=20&fields=key,title,author_name,first_publish_year`,
      { signal: controller.signal },
    );
    if (!response.ok) throw new Error('Serviço indisponível.');
    const books = parseBooks(await response.json());
    await cacheBooks(query, books);
    return { books, updated: new Date().toISOString(), offline: false, cached: false };
  } catch {
    if (cached) return { ...cached, offline: true, cached: true };
    throw new Error(
      'Não foi possível consultar a biblioteca. Verifique sua conexão e tente novamente. Buscas já realizadas ficam disponíveis offline.',
    );
  } finally {
    clearTimeout(timeout);
  }
}
