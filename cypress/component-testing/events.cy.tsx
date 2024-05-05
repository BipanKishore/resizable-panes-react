import React from 'react'
import {RPTestWrapper} from '../components/rp-test-wrapper'
import {RCy} from '../utils'
import {rScontainerId, CK0, CK1, R0, P0, P1, P2, P3, P4, R2} from './fix-test-ids'
import {_2PaneWithMinMax} from './pane-model-config-sets'
import {SinonSpy} from 'cypress/types/sinon'
import {Pane, ResizablePanes} from '../../src'
import {CustomResizerFirst} from '../components/custom-resizer'

describe('Test onChangeVisibility Rejected param', () => {
  let onChangeVisibility: SinonSpy

  const rCy = new RCy({
    resizerSize: 1,
    containerId: rScontainerId,
    len: 2
  })

  beforeEach(() => {
    rCy.setViewPort()
    onChangeVisibility = cy.spy()
    cy.mount(
      <RPTestWrapper
        panesList={_2PaneWithMinMax}
        resizerClass='bg-slate-500'
        resizerSize={1}
        storageApi={localStorage}
        uniqueId={rScontainerId}
        vertical
        onChangeVisibility={onChangeVisibility}
      >
      </RPTestWrapper>
    )
  })

  // Edge
  it('Hiding P0- P1 will become 1000 not 1001 as max = 100 x 10 with No Resizer', () => {
    rCy.cyGet(CK0).click()
    cy.wait(50)
      .then(() => {
        const rejectedArrgs = onChangeVisibility.getCall(1).args

        expect(rejectedArrgs).to.deep.equal([{
          P0: 'hidden',

          P1: 'visible'
        }])

        rCy.checkWidths(
          {
            P0: 0,
            [R0]: 0,
            P1: 1000
          }
        )
      })
  })

  // Edge
  it('Hiding P1- P2 will become 1000 not 1001 as max = 100 x 10 with No Resizer', () => {
    rCy.cyGet(CK1).click()
    cy.wait(50)
      .then(() => {
        const rejectedArrgs = onChangeVisibility.getCall(1).args

        expect(rejectedArrgs).to.deep.equal([{
          P0: 'visible',
          P1: 'hidden'
        }])

        rCy.checkWidths(
          {P0: 1000, [R0]: 0, P1: 0}
        )
      })
  })
})

describe('sdf', () => {
  let onMaxSize: SinonSpy
  let onNormalSize: SinonSpy
  let onMinSize: SinonSpy

  const rCy = new RCy({
    resizerSize: 10,
    containerId: rScontainerId,
    len: 5
  })

  beforeEach(() => {
    rCy.setViewPort()
    onMaxSize = cy.spy()
    onNormalSize = cy.spy()
    onMinSize = cy.spy()
    cy.mount(
      <div className="h-300 w-100p">
        <ResizablePanes
          resizer={<CustomResizerFirst horizontal={false} size={10} />}
          resizerSize={10}
          storageApi={localStorage}
          uniqueId={rScontainerId}
          vertical
        >
          <Pane className="bg-cyan-500" id={P0} minSize={0.1} size={1}></Pane>

          <Pane
            className="bg-red-500"
            id={P1}
            maxSize={5}
            minSize={1}
            size={3}
          >
          </Pane>
          <Pane
            className="bg-cyan-500"
            id={P2}
            maxSize={4}
            minSize={0.5}
            size={2}
            onMaxSize={onMaxSize}
            onMinSize={onMinSize}
            onNormalSize={onNormalSize}
          >
          </Pane>

          <Pane
            className="bg-red-500"
            id={P3}
            maxSize={5}
            minSize={1}
            size={3}
          >
          </Pane>
          <Pane className="bg-cyan-500" id={P4} minSize={0.1} size={1}></Pane>
        </ResizablePanes>
      </div>
    )
  })

  it.only('sh', () => {
    rCy.move(R2, rScontainerId, 'left')
    cy.wait(100)
      .then(() => {
        expect(onMinSize.getCall(1))
        console.log('v-----------------', onMinSize.getCall(1))
        console.log('v-----------------', onMaxSize.getCalls())
      })
  })

  it.only('sh', () => {
    rCy.move(R2, rScontainerId, 'right')
    cy.wait(100)
      .then(() => {
        console.log('v-----------------', onMinSize.getCalls())
        console.log('v-----------------', onMaxSize.getCalls())
      })
  })
})
