import {editFrameUrl, setAnimationProps, publishNode, flushHtmlCache, textNodePath} from '../support/animate'

describe('Animate — Edit mode (no animation)', () => {
    before(() => {
        cy.login()
        setAnimationProps(textNodePath('test-page'), {animation: 'fadeIn'})
        publishNode(`/sites/animatetest/home/test-page`)
        flushHtmlCache()
    })

    it('wrapper div exists in edit mode', () => {
        cy.login()
        cy.visit(editFrameUrl('test-page'))
        cy.get('[id^="animate-"]').should('exist')
    })

    it('no animate.min.css link in edit mode', () => {
        cy.login()
        cy.visit(editFrameUrl('test-page'))
        cy.get('link[href*="animate.min.css"]').should('not.exist')
    })

    it('wrapper has no inert attribute in edit mode', () => {
        cy.login()
        cy.visit(editFrameUrl('test-page'))
        cy.get('[id^="animate-"]').should('not.have.attr', 'inert')
    })

    it('wrapper has no opacity:0 in edit mode (always visible)', () => {
        cy.login()
        cy.visit(editFrameUrl('test-page'))
        cy.get('[id^="animate-"]').invoke('css', 'opacity').should('not.eq', '0')
    })

    it('no animation script injected in edit mode', () => {
        cy.login()
        cy.visit(editFrameUrl('test-page'))
        cy.wait(500)
        cy.get('[id^="animate-"]').should('not.have.class', 'animated')
    })
})
