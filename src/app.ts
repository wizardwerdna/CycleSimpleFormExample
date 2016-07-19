import {Observable as O} from 'rxjs';
import {run} from '@cycle/rxjs-run';
import {button, div, hr, label, input, makeDOMDriver} from '@cycle/dom';
import * as $ from 'jquery';
window['jQuery'] = $;
window['$'] = $;
require('bootstrap-loader');

run(main, {DOM: makeDOMDriver('#app')});

function main({DOM}) {
  const username$ = DOM.select('#username').events('input');
  const password$ = DOM.select('#password').events('input');
  const loginButton$ = DOM.select('#login').events('click');
  const form$ = O.combineLatest(
    username$.map(e => e.target.value),
    password$.map(e => e.target.value),
    (username, password) => ({username, password})
  );
  const action$: O<any> = O.merge(
    form$.map( formData => loginButton$.mapTo((
      { type: 'LOGIN', payload: formData }
    ))).switch()
  ).distinctUntilChanged();

  const reducer$ = O.merge(
    action$
      .filter((action) => action.type === 'LOGIN')
      .map(action => function loginReducer(state) {
        return state +
          `$$$ login(${action.payload.username}, ${action.payload.password})`;
      })
  );

  const state$ = reducer$.scan((state, next) => next(state), '')
    .startWith('');

  return {DOM: state$.map(state =>
    div('.container', {props: {style: 'margin: 1pc'}}, [
      div(state),
      div('.form', {props: {style: 'outline: 1pt solid blue; padding: 1pc'}}, [
        div('.form-group', [
          label({props: {for: 'username'}}, 'Username'),
          input('#username.form-control', {props: {type: 'text', autofocus: true}}),
        ]),
        div('form-group', [
          label({props: {for: 'password'}}, 'Password'),
          input('#password.form-control', {props: {type: 'password'}}),
        ]),
        hr(),
        div('.form-group', [
          button('#login.form-control.btn.btn-primary', 'Log In')
        ])
      ])
    ])
  )};
}
