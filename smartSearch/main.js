const { fromEvent, from, merge } = rxjs;
const { ajax } = rxjs.ajax;
const { mergeMap, switchMap, pluck, retry, map, filter, debounceTime, distinctUntilChanged, mapTo, scan } =
	rxjs.operators;

const url = "http://127.0.0.1:3000/people/quarter-error";
const keyword = document.querySelector("#keyword");
const result = document.querySelector("#result");

const searchInit$ = fromEvent(keyword, "keyup").pipe(
	filter((event) => event.code != "Backspace"), // 백스페이스 생략
	pluck("target", "value"),
	filter((typed) => typed.length > 1),
	debounceTime(500),
	distinctUntilChanged(),
);

const searching$ = searchInit$.pipe(mapTo('<div class="searching">Searching...</div>'));

const searchResult$ = searchInit$.pipe(
	switchMap((keyword) => ajax(`${url}?name=${keyword}`).pipe(retry(3))),
	pluck("response"),
	mergeMap((results) =>
		from(results).pipe(
			map((person) => `${person.first_name} ${person.last_name}`),
			map((name) => `<article>${name}</article>`),
			scan((acc, article) => (acc += article), ""),
		),
	),
);

merge(searching$, searchResult$).subscribe((text) => (result.innerHTML = text));
