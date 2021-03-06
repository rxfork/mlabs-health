import test from 'ava'
import { startWith as rxStartWith } from 'rxjs/operators'
import { sleeP } from '@meltwater/phi'

import createHealthCheck, { defaultError } from './check'
import createHealthEvents from './events'
import createHealthObservables, {
  createSource,
  createSources,
  createValue,
  count,
  attempts,
  availability,
  date,
  downtime,
  duration,
  error,
  failures,
  health,
  healthy,
  reliability,
  status,
  streams,
  successes,
  unhealthy,
  uptime
} from './observables'

test.beforeEach((t) => {
  const healthCheck = createHealthCheck((x = true) => x, { cache: null })
  const events = createHealthEvents(healthCheck)
  t.context.emit = events.emit
  t.context.source = createSource(events)
})

/* default */

test('creates observables', async (t) => {
  const keys = [...Object.keys(streams), 'health', 'status']
  const healthCheck = createHealthCheck(true)
  const events = createHealthEvents(healthCheck)
  const observables = createHealthObservables(events)
  const { emit } = events
  keys.forEach((k) =>
    observables[k].subscribe((x) => {
      t.true(x !== undefined)
    })
  )
  await emit(true)
  await emit(false)
})

test('creates observables with initial values', async (t) => {
  t.plan(1)
  const healthCheck = createHealthCheck((x) => x)
  const events = createHealthEvents(healthCheck)
  const { health } = createHealthObservables(events, {
    initialValues: [{ healthy: true, error: null, cached: false }]
  })
  health.subscribe((x) => {
    t.deepEqual(x, { healthy: true, error: null, cached: false })
  })
})

test('creates observables with delay', async (t) => {
  t.plan(3)
  const healthCheck = createHealthCheck((x) => x, { cache: null })
  const events = createHealthEvents(healthCheck)
  const { healthy } = createHealthObservables(events, {
    delay: 1000
  })
  const { emit } = events

  let i = 0
  healthy.subscribe((x) => {
    i++
    if (i === 1 || i === 3) {
      t.true(x, `where healthy after ${i} checks`)
    } else {
      t.false(x, `where unhealthy after ${i} checks`)
    }
  })

  await emit(false)
  await sleeP(200)
  await emit(false)
  await emit(false)
  await emit(false)
  await sleeP(1000)
  await emit(true)
  await emit(false)
  await emit(true)
})

test('creates observables with delay before healthy', async (t) => {
  t.plan(3)
  const healthCheck = createHealthCheck((x) => x, { cache: null })
  const events = createHealthEvents(healthCheck)
  const { healthy } = createHealthObservables(events, {
    delay: 1000
  })
  const { emit } = events

  let i = 0
  healthy.subscribe((x) => {
    i++
    if (i < 3) {
      t.true(x, `where healthy after ${i} checks`)
    } else {
      t.false(x, `where unhealthy after ${i} checks`)
    }
  })

  await emit(false)
  await sleeP(200)
  await emit(false)
  await emit(true)
  await sleeP(1000)
  await emit(true)
  await emit(false)
})

test('creates observables which filter cached checks', async (t) => {
  t.plan(3)
  const healthCheck = createHealthCheck((x) => x)
  const events = createHealthEvents(healthCheck)
  const { health, healthy, attempts } = createHealthObservables(events)
  const { emit } = events
  health.subscribe((x) => {
    t.deepEqual(
      x,
      { healthy: true, error: null, cached: false },
      'where health is not cached'
    )
  })
  healthy.subscribe((x) => {
    t.true(x, 'where is healthy')
  })
  attempts.subscribe((x) => {
    t.is(x, 1, 'where number of attempts is for uncached checks')
  })
  await emit(true)
  await emit(false)
  await emit(true)
  await emit(false)
})

test('creates observables which include cached checks', async (t) => {
  t.plan(3 * 4)
  const healthCheck = createHealthCheck((x) => x)
  const events = createHealthEvents(healthCheck)
  const { health, healthy, attempts } = createHealthObservables(events, {
    ignoreCached: false
  })
  const { emit } = events
  let i = 0
  health.subscribe((x) => {
    i++
    t.deepEqual(
      x,
      { healthy: true, error: null, cached: i > 1 },
      'where health is not cached'
    )
  })
  healthy.subscribe((x) => {
    t.true(x, 'where is healthy')
  })

  let j = 0
  attempts.subscribe((x) => {
    j++
    t.is(x, j, 'where number of attempts is for all checks')
  })
  await emit(true)
  await emit(false)
  await emit(true)
  await emit(false)
})

/* createSource */

test('creates source from events', async (t) => {
  t.plan(3 * 2)
  const healthCheck = createHealthCheck((x) => x, { cache: null })
  const events = createHealthEvents(healthCheck)
  const source = createSource(events)
  let i = 0
  source.subscribe(({ healthy, error, cached }) => {
    i++
    if (i === 1) {
      t.true(healthy, `where healthy for check ${i}`)
      t.is(error, null, `where no error for check ${i}`)
    } else {
      t.false(healthy, `where unhealthy for check ${i}`)
      t.deepEqual(error, new Error(defaultError), `where error for check ${i}`)
    }
    t.false(cached, `where not cached for check ${i}`)
  })
  const { emit } = events
  await emit(true)
  await emit(false)
})

/* createSources */

test('creates sources', async (t) => {
  const keys = [...Object.keys(streams), 'health', 'status']
  const sources = createSources(t.context.source)
  keys.forEach((k) =>
    sources[k].subscribe((x) => {
      t.true(x !== undefined)
    })
  )
  await t.context.emit(true)
  await t.context.emit(false)
})

/* createValue */

test('creates value', async (t) => {
  const source = healthy(t.context.source)
  const value = createValue(source, false)
  t.false(value(), 'for value 1')
  await t.context.emit(true)
  t.true(value(), 'for value 2')
  await t.context.emit(false)
  t.false(value(), 'for value 3')
})

/* health */

test('creates health observable', async (t) => {
  t.plan(1)
  const source = health(t.context.source)
  source.subscribe((x) => {
    t.deepEqual(x, { healthy: true, error: null, cached: false })
  })
  await t.context.emit(true)
})

/* healthy */

test('creates healthy observable when healthy', async (t) => {
  t.plan(1)
  const source = healthy(t.context.source)
  source.subscribe((x) => {
    t.true(x)
  })
  await t.context.emit(true)
})

test('creates healthy observable when unhealthy', async (t) => {
  t.plan(1)
  const source = healthy(t.context.source)
  source.subscribe((x) => {
    t.false(x)
  })
  await t.context.emit(false)
})

/* unhealthy */

test('creates unhealthy observable when healthy', async (t) => {
  t.plan(1)
  const source = unhealthy(t.context.source)
  source.subscribe((x) => {
    t.false(x)
  })
  await t.context.emit(true)
})

test('creates unhealthy observable when unhealthy', async (t) => {
  t.plan(1)
  const source = unhealthy(t.context.source)
  source.subscribe((x) => {
    t.true(x)
  })
  await t.context.emit(false)
})

/* error */

test('creates error observable when healthy', async (t) => {
  t.plan(1)
  const source = error(t.context.source)
  source.subscribe((x) => {
    t.is(x, null)
  })
  await t.context.emit(true)
})

test('creates error observable when unhealthy', async (t) => {
  t.plan(1)
  const healthCheck = createHealthCheck((x) => {
    throw new Error('On fire!')
  })
  const events = createHealthEvents(healthCheck)
  const source = error(createSource(events))
  source.subscribe((x) => {
    t.deepEqual(x, new Error('On fire!'))
  })
  const { emit } = events
  await emit(false)
})

/* attempts */

test('creates attempts observable', async (t) => {
  const source = attempts(t.context.source).pipe(rxStartWith(0))
  const value = createValue(source)
  t.is(value(), 0, 'for initial value')
  await t.context.emit()
  await t.context.emit()
  t.is(value(), 2, 'after 2 checks')
  await t.context.emit()
  await t.context.emit()
  t.is(value(), 4, 'after 4 checks')
})

/* successes */

test('creates successes observable', async (t) => {
  const source = successes(t.context.source).pipe(rxStartWith(0))
  const value = createValue(source)
  t.is(value(), 0, 'for initial value')
  await t.context.emit(true)
  t.is(value(), 1, 'after 1 check')
  await t.context.emit(false)
  await t.context.emit(false)
  t.is(value(), 1, 'after 3 checks')
  await t.context.emit(true)
  t.is(value(), 2, 'after 4 checks')
})

/* failures */

test('creates failures observable', async (t) => {
  const source = failures(t.context.source).pipe(rxStartWith(0))
  const value = createValue(source)
  t.is(value(), 0, 'for initial value')
  await t.context.emit(true)
  t.is(value(), 0, 'after 1 check')
  await t.context.emit(false)
  await t.context.emit(false)
  t.is(value(), 2, 'after 3 checks')
  await t.context.emit(true)
  t.is(value(), 2, 'after 4 checks')
})

/* date */

test('creates date observable', async (t) => {
  const now = new Date()
  const source = date(t.context.source).pipe(rxStartWith(now))
  const value = createValue(source)
  t.is(value(), now, 'for initial value')
  await t.context.emit(true)
  const next = value()
  t.true(next > now, 'where date is newer after 1 check')
  await t.context.emit(false)
  t.true(value() > next, 'where date is newer after 2 checks')
})

/* count */

test('creates count observable', async (t) => {
  const source = count(t.context.source).pipe(rxStartWith(0))
  const value = createValue(source)
  t.is(value(), 0, 'for initial value')
  await t.context.emit(true)
  await t.context.emit(true)
  t.is(value(), 2, 'after 2 checks')
  await t.context.emit(true)
  await t.context.emit(false)
  t.is(value(), 1, 'after 4 checks')
  await t.context.emit(false)
  await t.context.emit(false)
  t.is(value(), 3, 'after 6 checks')
})

/* duration */

test('creates duration observable', async (t) => {
  const dt = 220
  const source = duration(t.context.source).pipe(rxStartWith(0))
  const value = createValue(source)
  t.is(value(), 0, 'for initial value')

  await sleeP(dt)
  await t.context.emit(true)
  await sleeP(dt)
  await t.context.emit(true)
  t.true(value() >= dt - 1 && value() < 2 * dt, 'after 2 checks')

  await sleeP(3 * dt)
  await t.context.emit(true)
  t.true(value() >= 4 * dt - 1 && value() < 5 * dt, 'after 3 checks')

  await t.context.emit(false)
  t.is(value(), 0, 'after 4 checks')

  await sleeP(dt)
  await t.context.emit(true)
  t.is(value(), 0, 'after 5 checks')

  await sleeP(3 * dt)
  await t.context.emit(true)
  await t.context.emit(true)
  t.true(value() >= 3 * dt - 1 && value() < 4 * dt, 'after 6 checks')
})

/* uptime */

test('creates uptime observable', async (t) => {
  const dt = 220
  const source = uptime(t.context.source).pipe(rxStartWith(0))
  const value = createValue(source)
  t.is(value(), 0, 'for initial value')

  await sleeP(dt)
  await t.context.emit(true)
  await sleeP(dt) // up
  await t.context.emit(true)
  t.true(value() >= dt - 1 && value() < 2 * dt, 'after 2 checks')

  await sleeP(dt) // up
  await t.context.emit(false)
  await sleeP(1 * dt) // down
  t.true(value() >= 2 * dt - 1 && value() < 3 * dt, 'after 3 checks')

  await t.context.emit(true)
  await sleeP(2 * dt) // up
  await t.context.emit(false)
  await sleeP(3 * dt) // down
  await t.context.emit(false)
  t.true(value() >= 4 * dt - 1 && value() < 5 * dt, 'after 5 checks')
})

/* downtime */

test('creates downtime observable', async (t) => {
  const dt = 220
  const source = downtime(t.context.source).pipe(rxStartWith(0))
  const value = createValue(source)
  t.is(value(), 0, 'for initial value')

  await sleeP(dt)
  await t.context.emit(true)
  await sleeP(dt) // up
  await t.context.emit(true)
  t.is(value(), 0, 'after 2 checks')

  await sleeP(dt) // up
  await t.context.emit(false)
  await sleeP(1 * dt) // down
  await t.context.emit(true)
  t.true(value() >= dt - 1 && value() < 2 * dt, 'after 4 checks')

  await sleeP(dt) // up
  await t.context.emit(false)
  await sleeP(3 * dt) // down
  await t.context.emit(false)
  t.true(value() >= 4 * dt - 1 && value() < 5 * dt, 'after 6 checks')
})

/* availability */

test('creates availability observable', async (t) => {
  const dt = 220
  const source = availability(t.context.source).pipe(rxStartWith(1))
  const value = createValue(source)
  t.is(value(), 1, 'for initial value')

  await sleeP(dt)
  await t.context.emit(true)
  await sleeP(dt) // up
  await t.context.emit(true)
  t.is(value(), 1, 'after 2 checks')

  await sleeP(dt) // up
  await t.context.emit(false)
  await sleeP(1 * dt) // down
  await t.context.emit(true)
  t.true(value() > 0.5 && value() < 0.7, 'after 4 checks')

  await sleeP(dt) // up
  await t.context.emit(false)
  await sleeP(3 * dt) // down
  await t.context.emit(false)
  t.true(value() > 0.3 && value() < 0.5, 'after 4 checks')
})

/* reliability */

test('creates reliability observable', async (t) => {
  const source = reliability(t.context.source).pipe(rxStartWith(1))
  const value = createValue(source)
  t.is(value(), 1, 'for initial value')

  await t.context.emit(true)
  await t.context.emit(true)
  t.is(value(), 1, 'after 2 checks')

  await t.context.emit(false)
  await t.context.emit(false)
  t.is(value(), 0.5, 'after 4 checks')

  await t.context.emit(true)
  t.is(value(), 0.6, 'after 5 checks')
})

/* status */

test('creates status observable', async (t) => {
  t.plan(1)
  const source = status(t.context.source, {
    a: healthy(t.context.source),
    b: unhealthy(t.context.source)
  })
  source.subscribe((x) => {
    t.deepEqual(x, { a: true, b: false })
  })
  await t.context.emit(true)
})
