import React, { useState } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootParams } from '../navigation';
import { Book } from '../domain';
import { searchBooks } from '../services/books';
import { Button, Empty, ErrorMessage, Field, Heading, Page, colors, message, styles } from '../ui';
export function BooksScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootParams>>();
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [searched, setSearched] = useState(false);
  async function search() {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    setBooks([]);
    setSearched(false);
    try {
      const result = await searchBooks(query);
      setBooks(result.books);
      setSearched(true);
      if (result.cached)
        setNotice(
          `${result.offline ? 'Sem conexão. ' : ''}Exibindo busca salva em ${new Date(result.updated).toLocaleDateString('pt-BR')}.`,
        );
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function open(book: Book) {
    try {
      await Linking.openURL(`https://openlibrary.org${book.key}`);
    } catch {
      setError('Não foi possível abrir o link. Verifique sua conexão.');
    }
  }
  return (
    <Page>
      <Heading title="Biblioteca" subtitle="Encontre uma leitura para o seu próximo aprendizado." />
      <View style={styles.card}>
        <Field
          label="Título, autor ou assunto"
          value={query}
          onChangeText={setQuery}
          maxLength={100}
          placeholder="Ex.: programação, biologia…"
          onSubmitEditing={() => {
            void search();
          }}
          returnKeyType="search"
        />
        <Button
          title="Buscar livros"
          icon="search"
          busy={busy}
          onPress={() => {
            void search();
          }}
        />
        <Text style={styles.subtitle}>
          Catálogo da Open Library. Buscas recentes ficam salvas por 24 horas. As últimas 30 buscas
          podem ser consultadas offline.
        </Text>
      </View>
      <ErrorMessage message={error} />
      {!!notice && (
        <Text accessibilityLiveRegion="polite" style={styles.subtitle}>
          {notice}
        </Text>
      )}
      {busy && (
        <View style={styles.row}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.subtitle}>Consultando a biblioteca…</Text>
        </View>
      )}
      {books.map((book) => (
        <View key={book.key} style={styles.card}>
          <View style={[styles.row, { flexWrap: 'nowrap', alignItems: 'flex-start' }]}>
            <View style={{ backgroundColor: colors.light, borderRadius: 12, padding: 14 }}>
              <Ionicons name="book-outline" size={28} color={colors.primary} />
            </View>
            <View style={{ flex: 1, gap: 5 }}>
              <Text style={styles.section}>{book.title}</Text>
              <Text style={styles.subtitle}>
                {book.author}
                {book.year ? ` · ${book.year}` : ''}
              </Text>
            </View>
          </View>
          <Button
            title="Criar tarefa de leitura"
            secondary
            icon="add"
            onPress={() =>
              navigation.navigate('Editor', {
                title: `Ler: ${book.title}`.slice(0, 120),
                notes: `${book.author}\nhttps://openlibrary.org${book.key}`,
              })
            }
          />
          <Button
            title="Ver na Open Library"
            secondary
            icon="open-outline"
            onPress={() => {
              void open(book);
            }}
          />
        </View>
      ))}
      {!busy && !error && !books.length && (
        <Empty
          icon="book-outline"
          title={searched ? 'Nenhum livro encontrado' : 'Conhecimento à sua espera'}
          body={
            searched
              ? 'Tente outro título, autor ou assunto.'
              : 'Busque um assunto e transforme uma leitura em uma tarefa.'
          }
        />
      )}
    </Page>
  );
}
