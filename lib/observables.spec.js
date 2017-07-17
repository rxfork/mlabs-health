import test from 'ava'

import createHealthCheck from './check'
import createHealthEvents from './events'
import createHealthObservables, {
  createSource,
  createValue,
  observables,
  healthy,
  status
} from './observables'

test.beforeEach(t => {
  const healthCheck = createHealthCheck(x => x)
  const events = createHealthEvents(healthCheck)
  t.context.emit = events.emit
  t.context.source = createSource(events)
})

/* default */

test('creates observables', async t => {
  const keys = [...Object.keys(observables), 'health', 'status']
  t.plan(keys.length)
  const healthCheck = createHealthCheck(true)
  const events = createHealthEvents(healthCheck)
  const sources = createHealthObservables(events)
  const { emit } = events
  keys.forEach(k => sources[k].subscribe(x => { t.truthy(x) }))
  await emit(true)
})

/* createSource */

test('creates source from events', async t => {
  t.plan(3)
  const healthCheck = createHealthCheck(x => x)
  const events = createHealthEvents(healthCheck)
  const source = createSource(events)
  source.subscribe(({healthy, error, cached}) => {
    t.false(healthy)
    t.false(cached)
    t.truthy(error)
  })
  const { emit } = events
  await emit(false)
})

/* createValue */

test('creates value', async t => {
  const source = healthy(t.context.source)
  const value = createValue(source, false)
  t.false(value())
  await t.context.emit(true)
  t.true(value())
})

/* healthy */

test('creates healthy observable', async t => {
  t.plan(1)
  const source = healthy(t.context.source)
  source.subscribe(x => { t.true(x) })
  await t.context.emit(true)
})

test('creates unhealthy observable', async t => {
  t.plan(1)
  const source = healthy(t.context.source)
  source.subscribe(x => { t.false(x) })
  await t.context.emit(false)
})

/* status */

test('creates status observable', async t => {
  t.plan(1)
  const source = status(t.context.source, {
    a: healthy(t.context.source),
    b: healthy(t.context.source)
  })
  source.subscribe(x => { t.deepEqual(x, {a: true, b: true}) })
  await t.context.emit(true)
})