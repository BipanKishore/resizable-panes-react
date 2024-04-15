import {CyMoveEvent} from '../utils/events'
import {checkWidthsAndSum} from '../utils/check-widths'
import {getResizableIds} from '../utils'

const {
  containerSize,
  resizerSize,
  viewPortDimention,
  resizerIds: [R0, R1, R2, R3],
  checkboxIds: [CK0, CK1, CK2, CK3, CK4],
  paneIds: [P0, P1, P2, P3, P4]
} = getResizableIds(5)

const cyMoveEvent = new CyMoveEvent({
  maxPaneSize: 1000,
  paneIds: [],
  resizerSize: 10
})

const checkWidths = checkWidthsAndSum.bind(null, containerSize)

describe('Overlapping resizer to another', () => {
  beforeEach(() => {
    cy.viewport(...viewPortDimention)
    cy.visit('')
  })

  describe('Single Resizer Movements', () => {
    describe('R0 Movements', () => {
      it('Overlap R0 to R1', () => {
        cyMoveEvent.moveItem(R0, R1)
        checkWidths({
          [P0]: 410,
          [P1]: 0,
          [P2]: 200,
          [P3]: 300,
          [P4]: 100,
          [R0]: resizerSize,
          [R1]: 0,
          [R2]: resizerSize,
          [R3]: resizerSize
        })
      })
    })
  })

  describe('Single Resizer Movements', () => {
    describe('R0 Movements', () => {
      it('Overlap R0 to R1', () => {
        cyMoveEvent.moveItem(R0, R1)

        checkWidths({
          [P0]: 410,
          [P1]: 0,
          [P2]: 200,
          [P3]: 300,
          [P4]: 100,
          [R0]: resizerSize,
          [R1]: 0,
          [R2]: resizerSize,
          [R3]: resizerSize
        })
      })

      it('Overlap R2 to R1', () => {
        cyMoveEvent.moveItem(R2, R1)
        checkWidths({
          [P0]: 100,
          [P1]: 300,
          [P2]: 0,
          [P3]: 510,
          [P4]: 100,
          [R0]: resizerSize,
          [R1]: 0,
          [R2]: resizerSize,
          [R3]: resizerSize
        })
      })

      it('Overlap R2 to R3', () => {
        cyMoveEvent.moveItem(R2, R3)
        checkWidths({
          [P0]: 100,
          [P1]: 300,
          [P2]: 510,
          [P3]: 0,
          [P4]: 100,
          [R0]: resizerSize,
          [R1]: resizerSize,
          [R2]: resizerSize,
          [R3]: 0
        })
      })

      it('Overlap R0 to R1 >> R0 to Start', () => {
        cyMoveEvent.moveItem(R0, R1)
        cyMoveEvent.moveResizerToStart(R0)
        checkWidths({
          [P0]: 0,
          [P1]: 400,
          [P2]: 200,
          [P3]: 300,
          [P4]: 100,
          [R0]: resizerSize,
          [R1]: resizerSize,
          [R2]: resizerSize,
          [R3]: resizerSize
        })
      })

      it('Overlap R0 to R3 >> R0 to start >> R1 to start >> R2 to start >> R3 to start', () => {
        cyMoveEvent.moveItem(R0, R3)

        checkWidths({
          [P0]: 930,
          [P1]: 0,
          [P2]: 0,
          [P3]: 0,
          [P4]: 100,
          [R0]: resizerSize,
          [R1]: 0,
          [R2]: 0,
          [R3]: 0
        })

        cyMoveEvent.moveResizerToStart(R0)

        checkWidths({
          [P0]: 0,
          [P1]: 920,
          [P2]: 0,
          [P3]: 0,
          [P4]: 100,
          [R0]: resizerSize,
          [R1]: resizerSize,
          [R2]: 0,
          [R3]: 0
        })

        cyMoveEvent.moveResizerToStart(R1)
        checkWidths({
          [P0]: 0,
          [P1]: 0,
          [P2]: 920,
          [P3]: 0,
          [P4]: 100,
          [R0]: 0,
          [R1]: resizerSize,
          [R2]: resizerSize,
          [R3]: 0
        })

        cyMoveEvent.moveResizerToStart(R2)
        checkWidths({
          [P0]: 0,
          [P1]: 0,
          [P2]: 0,
          [P3]: 920,
          [P4]: 100,
          [R0]: 0,
          [R1]: 0,
          [R2]: resizerSize,
          [R3]: resizerSize
        })

        cyMoveEvent.moveResizerToStart(R3)
        checkWidths({
          [P0]: 0,
          [P1]: 0,
          [P2]: 0,
          [P3]: 0,
          [P4]: 1030,
          [R0]: 0,
          [R1]: 0,
          [R2]: 0,
          [R3]: resizerSize
        })
      })
    })
  })
})