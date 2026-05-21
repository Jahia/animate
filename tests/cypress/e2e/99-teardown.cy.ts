import {deleteTestSite} from '../support/animate'

describe('Animate — Teardown', () => {
    it('deletes the test site', () => {
        cy.login()
        deleteTestSite()
    })
})
