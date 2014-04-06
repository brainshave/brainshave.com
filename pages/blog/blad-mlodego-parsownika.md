# Błąd młodego parsownika

Lublin, 2010-09-03.

**Parsownik** -- *osoba pisząca parsery.<br />
(Termin zawdzięczam mojemu bratu.)*

Od pierwszego wpisu tutaj minęły 2 tygodnie. Najlepsze jest to, że
zacząłem pisać następny wpis już następnego dnia po wystartowaniu
bloga. Cały wpis powstał bez sprawdzania czy kompiluje się ładnie do
HTML-a. Po ukończeniu skompilował się, niestety źle. Bardzo
źle. Tagi przeplatały się w nieprawidłowy sposób, np. gwiazdka gdzieś
wcześniej w którymś paragrafie i gwiazdka gdzieś dalej w wypunktowaniu
powodowały otoczenie to tagiem `<b>`. Co dawało np. takie wyjście:

    ... <p> ... <b> ... </p>
    <ul> <li> ... </b> ...

Mój parser działał ogólnie tak, że miał listę par: wyrażenie regularne +
funkcja, która wywoływana była na tekście do którego zostało
dopasowane to wyrażenie. Aby zapobiec złemu przeplataniu się tagów
wyrażenia ozdobników (takich jak pogrubienie, pochylenie,
podkreślenie; do tego używam pojedynczych znaków, np: `/asdf/` →
*`asdf`*) stały się bardzo skomplikowane. Mam na myśli coś
takiego (`@` to odpowiednik dla znacznika `<code>`):

    r"(?<!<|\w|[@])\@(?=\S)([^@]+)(?<=\S)\@(?=\W)"


Nie jestem specjalistą od wyrażeń regularnych ale użycie ich wydawało
mi się bardzo obiecujące. Szczególnie łatwo było na początku ;).

Przedstawione podejście miało poważne wady:

1. za każdym razem przetwarzany był cały tekst,
2. wyrażenia widziały go jako sam tekst a nie jako strukturę,
3. w praktyce dopuszczalne było przeplatanie się znaczników HTML j/w.

Ogólnie całość sprawiała wrażenie jakby trzymała się na rzęsach :P.
Ciągłe dopasowywanie regexpów mogło się szybko skończyć kodem
spaghetti... Jednym słowem...

## Porażka :D.

Mogłem spodziewać się tego po przeczytaniu
[tego wątku na Stack Overflow](http://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454).
Dotyczył on parsowania HTML-a więc najpierw pomyślałem, że moja
wymarzona składnia nie jest aż tak trudna do przetworzenia.

Wróciłem do Stack Overflow jak mój parser zaczął nawalać...

## Pyparsing

> Have you tried using an XML parser instead?<br />
> --- [Will](http://stackoverflow.com/questions/1732348/regex-match-open-tags-except-xhtml-self-contained-tags/1732454#1732454)


Wow. To mi dało myślenia. Oczywiście nie chodziło o użycie parsera XML-a
ale śladem "gotowych, dobrze sprawdzonych rozwiązań" trafiłem na
[pyparsing](http://pyparsing.wikispaces.com/).

Pyparsing jest (dla mnie, laika z tego tematu :P ) parserem dowolnie
zdefiniowanej gramatyki. Od np. [ANTLR-a](http://www.antlr.org/) różni się
tym, że gramatykę definiuje się za pomocą wyrażeń w Pythonie (używając
zwykłych operatorów takich jak `+` czy `|`)
zamiast tradycyjnego [EBNF](http://pl.wikipedia.org/wiki/Notacja_EBNF).

Idealnie dla mnie. Wystarczyło zrozumieć filozofię działania,
przeczytać
[krótką i przystępną instrukcję](http://pyparsing.svn.sourceforge.net/viewvc/pyparsing/src/HowToUsePyparsing.html)
oraz czasem zajrzeć do
[dokumentacji API](http://packages.python.org/pyparsing/).

### Prosty przykład
Skoro jesteśmy przy moich **pogrubieniach** za pomocą gwiazdki i
*pochyleniach* za pomocą ukośnika, proponuję prosty, rekurencyjny przykład.

Najpierw wersja nierekurencyjna:

    # -*- coding: utf-8 -*-
    from pyparsing import *
    from pprint import pprint

    undecorated = OneOrMore( # tłumaczy się samo przez się
                             Word( # słowo (przynajmniej 1 znak) złożone z:
                                   alphanums)) # litery i cyfry

    bold = "*" + undecorated + "*"   # prawda,
    italic = "/" + undecorated + "/" # że proste? :)

    # metoda parseString() służy do... parsowania napisów
    pprint(bold.parseString("*asdf*").asList())
    pprint(italic.parseString("/qwer/").asList())

Wynikiem tego będzie:

    ['*', 'asdf', '*']
    ['/', 'qwer', '/']

Jak widać, pyparsing dzieli łańcuch na kawałki określone w gramatyce
(tokeny). Domyślnie omija też ew. białe znaki pomiędzy nimi.

Rekurencyjny przykład będzie nieco dłuższy. Ponieważ Python nie pozwala
na używanie niezdefiniowanych symboli pyparsing załatwia to
klasą `Forward`, która umożliwia najpierw zadeklarowanie elementu
a później podanie jego definicji za pomocą operatora `<<`.

    # -*- coding: utf-8 -*-
    from pyparsing import *
    from pprint import pprint

    undecorated = OneOrMore( Word(alphanums))

    bold = Forward()
    italic = Forward()

    expression = OneOrMore( undecorated | bold | italic )

    # Domyślnie wszystkie elementy odnalezione przez pyparsing
    # zwracane są jako jednowymiarowa lista, Group stworzy
    # listę zagnieżdżoną dla tego dopasowania
    bold << Group("*" + expression + "*")
    italic << Group("/" + expression + "/")

    pprint(expression.parseString("""
    czysty tekst
    /krzywo/ *grubo*
    /*krzywo grubo*/ */grubo krzywo/*
    *grubo /krzywo i jeszcze raz *grubo*/*
    """).asList())


Tym razem wyjście wygląda tak:

    ['czysty', 'tekst',        # czysty tekst
     ['/', 'krzywo', '/'],     # /krzywo/
     ['*', 'grubo', '*'],      # *grubo*
     ['/', ['*', 'krzywo', 'grubo', '*'], '/'], # /*krzywo grubo*/
     ['*', ['/', 'grubo', 'krzywo', '/'], '*'], # */grubo krzywo/*
     ['*', 'grubo',
      ['/', 'krzywo', 'i', 'jeszcze', 'raz',
       ['*', 'grubo', '*'],
       '/'],
      '*']]

Ostatni kawałek jest szczególnie ciekawy. Zostawiam go
do samodzielnego przeanalizowania :P. Dla mnie to była eureka,
która pozwoliła mi dalej popchnąć projekt :)

Oba przykłady umieszczone są w [jednym pliku](olt/input/blad-mlodego-parsownika.py).
Plik ten posiada jeszcze jeden cukierek dla osób wnikliwych ;).
Przedstawiony przykład jest uproszczeniem analogicznego kodu
z mojego [parsera](http://github.com/santamon/makeblog/blob/master/txt-to-html/txt-to-html.py).

Takie drzewko jak w ostatnim listingu możemy już dowolnie przetworzyć
manipulując listami, albo użyć metody `setParseAction(fn)` na każdym
zdefiniowanym elemencie gramatyki, gdzie `fn` to funkcja.
Jeśli `fn` zwróci jakąś wartość to element w drzewie zostanie
zastąpiony tą wartością.

## Podsumowanie

Nowy parser pozbawiony jest wad poprzedniego, przede wszystkim:

1. działa,
2. jest bardziej przewidywalny,
3. kod jest bardziej przejrzysty,
4. jest łatwiej rozszerzalny.

Polecam przyjrzeć się [pyparsing](http://pyparsing.wikispaces.com/)
jeśli mamy potrzebę/chęć przetworzenia jakiegoś tekstu i piszemy w
Pythonie. Jeszcze raz podaję adres do
[samouczka](http://pyparsing.svn.sourceforge.net/viewvc/pyparsing/src/HowToUsePyparsing.html)
oraz do [dokumentacji API](http://packages.python.org/pyparsing/).
Pyparsing ma bardzo fajną licencję
([MIT](http://www.opensource.org/licenses/mit-license.php)), "róbta co
chceta ale pochwalcie się od kogo ściągaliście" :P ) i jest dość
popularne, co znaczy, że powinna być dostępna w Twojej Ulubionej
Dystrybucji ;).
