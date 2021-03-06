'use strict'

const { select, call, put, delay } = require('redux-saga/effects')
// ------------ Example ------------

const getGlobalState = () => ({
  user: { id: 'user1' },
  token: 'token',
})

const favItem = () => ({})
const successfulFavItemAction = (...args) => args
const receivedFavItemErrorAction = (...args) => args
const loadingFavItemAction = (...args) => args

// Example saga to be tested.
function* favSagaWorker(action) {
  const { itemId } = action.payload
  const { token, user } = yield select(getGlobalState)

  try {
    const response = yield call(favItem, itemId, token)
    const json = yield response.json()
    yield put(successfulFavItemAction(json, itemId, user))
  } catch (e) {
    yield put(receivedFavItemErrorAction(e, itemId))
  }
}

function* throwFavSagaWorker(action) {
  const { itemId } = action.payload
  const { token, user } = yield select(getGlobalState)

  try {
    const response = yield call(favItem, itemId, token)
    const json = yield response.json()
    yield put(successfulFavItemAction(json, itemId, user))
  } catch (e) {
    yield put(receivedFavItemErrorAction(e, itemId))
    throw e
  }
}

function* retryFavSagaWorker(action) {
  const { itemId } = action.payload
  const { token, user } = yield select(getGlobalState)

  let attempt = 0
  while (attempt++ < 5) {
    try {
      const response = yield call(favItem, itemId, token)
      const json = yield response.json()
      yield put(successfulFavItemAction(json, itemId, user))
      break
    } catch (e) {
      yield put(receivedFavItemErrorAction(e, itemId))
      yield delay(2000)
    }
  }
}

function* sagaWithNoPuts() {
  const { token, user } = yield select(getGlobalState)

  yield call(favItem, token, user)
}

function* sagaWithNestedSaga(action) {
  yield put(loadingFavItemAction(true))

  yield* favSagaWorker(action)

  yield put(loadingFavItemAction(false))
}

module.exports = {
  favSagaWorker,
  throwFavSagaWorker,
  retryFavSagaWorker,
  sagaWithNoPuts,
  sagaWithNestedSaga,
  getGlobalState,
  favItem,
  successfulFavItemAction,
  receivedFavItemErrorAction,
  loadingFavItemAction,
}
