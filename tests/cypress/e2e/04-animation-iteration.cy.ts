import {setAnimationProps, publishNode, flushHtmlCache, pageUrl, textNodePath} from '../support/animate'

describe('Animate — Iteration count', () => {
    context('infinite loop', () => {
        before(() => {
            cy.login()
            setAnimationProps(textNodePath('test-page'), {
                animation: 'pulse',
                animationIterationCount: 'infinite'
            })
            publishNode(`/sites/animatetest/home/test-page`)
            flushHtmlCache()
            cy.wait(2000)
        })

        it('wrapper has position:relative for pause button positioning', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]').invoke('css', 'position').should('eq', 'relative')
        })

        it('pause button is present and visible', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-pause-"]', {timeout: 3000}).should('be.visible')
        })

        it('pause button initial state: aria-pressed false, text "Pause animation"', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-pause-"]', {timeout: 3000})
                .should('have.attr', 'aria-pressed', 'false')
                .and('contain.text', 'Pause animation')
        })

        it('clicking pause button pauses the animation', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-pause-"]', {timeout: 3000}).click()
            cy.get('[id^="animate-"]').invoke('css', 'animation-play-state').should('eq', 'paused')
        })

        it('pause button updates aria-pressed to true after pause', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-pause-"]', {timeout: 3000}).click()
            cy.get('[id^="animate-pause-"]').should('have.attr', 'aria-pressed', 'true')
        })

        it('pause button text changes to "Resume animation" after pause', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-pause-"]', {timeout: 3000}).click()
            cy.get('[id^="animate-pause-"]').should('contain.text', 'Resume animation')
        })

        it('clicking resume restores animation play state', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-pause-"]', {timeout: 3000}).click()
            cy.get('[id^="animate-pause-"]').click()
            cy.get('[id^="animate-"]').invoke('css', 'animation-play-state').should('eq', 'running')
            cy.get('[id^="animate-pause-"]').should('have.attr', 'aria-pressed', 'false')
            cy.get('[id^="animate-pause-"]').should('contain.text', 'Pause animation')
        })
    })

    context('iteration count = 1 (default)', () => {
        before(() => {
            cy.login()
            setAnimationProps(textNodePath('test-page'), {animation: 'fadeIn', animationIterationCount: '1'})
            publishNode(`/sites/animatetest/home/test-page`)
            flushHtmlCache()
            cy.wait(2000)
        })

        it('pause button is absent when not looping', () => {
            cy.visit(pageUrl('test-page'))
            cy.wait(500)
            cy.get('[id^="animate-pause-"]').should('not.exist')
        })
    })

    after(() => {
        cy.login()
        setAnimationProps(textNodePath('test-page'), {animation: 'fadeIn'})
        publishNode(`/sites/animatetest/home/test-page`)
        flushHtmlCache()
    })
})
