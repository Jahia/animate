import {pageUrl, setAnimationProps, publishNode, flushHtmlCache, textNodePath} from '../support/animate'

describe('Animate — Accessibility (WCAG 2.1 AA)', () => {
    context('Initial hidden state (before reveal)', () => {
        it('wrapper starts with inert attribute (suppresses keyboard focus)', () => {
            // Intercept to check DOM before IntersectionObserver fires
            cy.visit(pageUrl('test-page'), {
                onBeforeLoad(win) {
                    // stub IntersectionObserver to never fire (check initial state)
                    win.IntersectionObserver = class {
                        observe() {}
                        disconnect() {}
                    } as any
                }
            })
            cy.get('[id^="animate-"]').should('have.attr', 'inert')
        })

        it('wrapper starts with aria-hidden="true"', () => {
            cy.visit(pageUrl('test-page'), {
                onBeforeLoad(win) {
                    win.IntersectionObserver = class {
                        observe() {}
                        disconnect() {}
                    } as any
                }
            })
            cy.get('[id^="animate-"]').should('have.attr', 'aria-hidden', 'true')
        })

        it('wrapper starts with visibility:hidden', () => {
            cy.visit(pageUrl('test-page'), {
                onBeforeLoad(win) {
                    win.IntersectionObserver = class {
                        observe() {}
                        disconnect() {}
                    } as any
                }
            })
            cy.get('[id^="animate-"]').invoke('css', 'visibility').should('eq', 'hidden')
        })
    })

    context('Revealed state (after IntersectionObserver fires)', () => {
        before(() => {
            cy.login()
            setAnimationProps(textNodePath('test-page'), {animation: 'fadeIn'})
            publishNode(`/sites/animatetest/home/test-page`)
            flushHtmlCache()
            cy.wait(2000)
        })

        it('inert attribute absent after reveal', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 5000}).should('not.have.attr', 'inert')
        })

        it('aria-hidden absent after reveal', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 5000}).should('not.have.attr', 'aria-hidden')
        })

        it('element is visible and reachable by keyboard after reveal', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 5000}).should('be.visible')
        })
    })

    context('Pause button — WCAG 2.2.2 SC (looping animation)', () => {
        before(() => {
            cy.login()
            setAnimationProps(textNodePath('test-page'), {animation: 'pulse', animationIterationCount: 'infinite'})
            publishNode(`/sites/animatetest/home/test-page`)
            flushHtmlCache()
            cy.wait(2000)
        })

        it('pause button is keyboard focusable (is a native button)', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-pause-"]', {timeout: 3000})
                .should('have.prop', 'tagName', 'BUTTON')
        })

        it('pause button has aria-pressed attribute', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-pause-"]', {timeout: 3000})
                .should('have.attr', 'aria-pressed')
        })

        it('pause button label is meaningful ("Pause animation")', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-pause-"]', {timeout: 3000})
                .invoke('text').should('match', /pause|resume/i)
        })

        after(() => {
            cy.login()
            setAnimationProps(textNodePath('test-page'), {animation: 'fadeIn'})
            publishNode(`/sites/animatetest/home/test-page`)
            flushHtmlCache()
        })
    })

    context('Exit animation — WCAG 2.4.3 (focus management)', () => {
        before(() => {
            cy.login()
            setAnimationProps(textNodePath('test-page'), {animation: 'fadeOut'})
            publishNode(`/sites/animatetest/home/test-page`)
            flushHtmlCache()
            cy.wait(2000)
        })

        it('element has aria-hidden="true" after exit animation ends', () => {
            cy.visit(pageUrl('test-page'))
            // wait for fadeOut animationend to fire
            cy.get('[id^="animate-"]', {timeout: 5000})
                .should('have.attr', 'aria-hidden', 'true')
        })

        it('element is hidden (display:none) after exit animation ends', () => {
            cy.visit(pageUrl('test-page'))
            cy.get('[id^="animate-"]', {timeout: 5000})
                .should('have.css', 'display', 'none')
        })

        after(() => {
            cy.login()
            setAnimationProps(textNodePath('test-page'), {animation: 'fadeIn'})
            publishNode(`/sites/animatetest/home/test-page`)
            flushHtmlCache()
        })
    })
})
