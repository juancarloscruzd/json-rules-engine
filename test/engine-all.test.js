'use strict'

import sinon from 'sinon'
import engineFactory from '../src/json-business-rules'

async function factSenior (params, engine) {
  return 65
}

async function factChild (params, engine) {
  return 10
}

async function factAdult (params, engine) {
  return 30
}

describe('Engine: "all" conditions', () => {
  let engine
  it('throws an exception if a fact has not been registered', () => {

  })

  describe('supports a single "all" condition', () => {
    let action = {
      type: 'ageTrigger',
      params: {
        demographic: 'under50'
      }
    }
    let conditions = {
      all: [{
        'fact': 'age',
        'operator': 'lessThan',
        'value': 50
      }]
    }
    let actionSpy = sinon.spy()
    beforeEach(() => {
      actionSpy.reset()
      let rule = factories.rule({ conditions, action })
      engine = engineFactory()
      engine.addRule(rule)
      engine.on('action', actionSpy)
    })

    it('emits when the condition is met', async () => {
      engine.addFact('age', factChild)
      await engine.run()
      expect(actionSpy).to.have.been.calledWith(action)
    })

    it('does not emit when the condition fails', () => {
      engine.addFact('age', factSenior)
      engine.run()
      expect(actionSpy).to.not.have.been.calledWith(action)
    })
  })

  describe('supports "any" with multiple conditions', () => {
    let conditions = {
      all: [{
        'fact': 'age',
        'operator': 'lessThan',
        'value': 50
      }, {
        'fact': 'age',
        'operator': 'greaterThan',
        'value': 21
      }]
    }
    let action = {
      type: 'ageTrigger',
      params: {
        demographic: 'adult'
      }
    }
    let actionSpy = sinon.spy()
    beforeEach(() => {
      actionSpy.reset()
      let rule = factories.rule({ conditions, action })
      engine = engineFactory()
      engine.addRule(rule)
      engine.on('action', actionSpy)
    })

    it('emits an action when every condition is met', async () => {
      engine.addFact('age', factAdult)
      await engine.run()
      expect(actionSpy).to.have.been.calledWith(action)
    })

    describe('a condition fails', () => {
      it('does not emit when the first condition fails', async () => {
        engine.addFact('age', factChild)
        await engine.run()
        expect(actionSpy).to.not.have.been.calledWith(action)
      })

      it('does not emit when the second condition', async () => {
        engine.addFact('age', factSenior)
        await engine.run()
        expect(actionSpy).to.not.have.been.calledWith(action)
      })
    })
  })
})