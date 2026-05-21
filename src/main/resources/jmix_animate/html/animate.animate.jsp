<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib prefix="template" uri="http://www.jahia.org/tags/templateLib" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<c:set var="animation" value="${currentNode.properties['j:animation'].string}"/>
<c:set var="animationDelayUsage" value="${currentNode.properties['j:animationDelayUsage'].string}"/>
<c:set var="animationDelay" value="${currentNode.properties['j:animationDelay'].double}"/>
<c:set var="animationIterationCount" value="${currentNode.properties['j:animationIterationCount'].string}"/>
<c:set var="identifier" value="${currentNode.identifier}"/>
<c:set var="hasLoop" value="${not empty animationIterationCount and animationIterationCount ne '1'}"/>
<c:choose>
    <c:when test="${renderContext.editMode}">
        <div id="animate-${identifier}">${wrappedContent}</div>
    </c:when>
    <c:otherwise>
        <template:addResources type="css" resources="animate.min.css"/>
        <%-- visibility:hidden suppresses keyboard focus in all browsers without inert support --%>
        <div id="animate-${identifier}" inert aria-hidden="true" style="opacity: 0; visibility: hidden;${hasLoop ? ' position: relative;' : ''}">
            ${wrappedContent}
            <c:if test="${hasLoop}">
            <%-- SC 2.2.2: pause control required when animation loops more than once --%>
            <button id="animate-pause-${identifier}"
                    style="position:absolute;top:0.5em;right:0.5em;z-index:1;padding:0.25em 0.75em;font-size:0.8rem;cursor:pointer;"
                    aria-pressed="false"
                    hidden>Pause animation</button>
            </c:if>
        </div>
        <template:addResources type="inline" targetTag="BODY">
            <script>
                (function () {
                    var el = document.getElementById('animate-${identifier}');
                    if (!el) return;
                    var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

                    function reveal() {
                        el.removeAttribute('inert');
                        el.removeAttribute('aria-hidden');
                        el.style.visibility = 'visible';
                        el.style.opacity = '1';
                        if (!reducedMotion) {
                            <c:if test="${not empty currentNode.properties['j:animationDuration']}">
                            el.style.animationDuration = '${currentNode.properties['j:animationDuration'].double}s';
                            </c:if>
                            <%-- SC 4.1.1: allowlist iterationCount before injecting into style --%>
                            var iterCount = '${fn:escapeXml(animationIterationCount)}';
                            if (/^(\d+|infinite)$/.test(iterCount) && iterCount !== '1') {
                                el.style.animationIterationCount = iterCount;
                            }
                            <%-- SC 4.1.1: allowlist animation class name before DOM injection --%>
                            var animClass = '${fn:escapeXml(animation)}';
                            if (/^[\w-]+$/.test(animClass)) {
                                el.classList.add('animated', animClass);
                            }
                            <c:if test="${fn:contains(animation, 'Out') or animation eq 'hinge'}">
                            <%-- SC 2.4.3: move focus before hiding to avoid silent focus loss --%>
                            el.addEventListener('animationend', function () {
                                if (el.contains(document.activeElement)) {
                                    var next = el.nextElementSibling || el.parentElement;
                                    if (next && typeof next.focus === 'function') next.focus();
                                }
                                el.setAttribute('aria-hidden', 'true');
                                el.style.display = 'none';
                            }, {once: true});
                            </c:if>
                            <c:if test="${hasLoop}">
                            <%-- SC 2.2.2: expose pause control for looping animations --%>
                            var pauseBtn = document.getElementById('animate-pause-${identifier}');
                            if (pauseBtn) {
                                pauseBtn.hidden = false;
                                pauseBtn.addEventListener('click', function () {
                                    var paused = el.style.animationPlayState === 'paused';
                                    el.style.animationPlayState = paused ? 'running' : 'paused';
                                    pauseBtn.setAttribute('aria-pressed', String(!paused));
                                    pauseBtn.textContent = paused ? 'Pause animation' : 'Resume animation';
                                });
                            }
                            </c:if>
                        }
                    }

                    var observer = new IntersectionObserver(function (entries) {
                        if (!entries[0].isIntersecting) return;
                        observer.disconnect();
                        <c:choose>
                            <c:when test="${animationDelayUsage eq 'delayBeforeDisplay' and animationDelay > 0}">
                            <%-- SC 2.3.3 / 2.2.2: skip delay for users who prefer reduced motion --%>
                            if (reducedMotion) {
                                reveal();
                            } else {
                                setTimeout(reveal, ${animationDelay} * 1000);
                            }
                            </c:when>
                            <c:otherwise>
                            if (!reducedMotion) {
                                <c:if test="${animationDelay > 0}">
                                el.style.animationDelay = '${animationDelay}s';
                                </c:if>
                            }
                            reveal();
                            </c:otherwise>
                        </c:choose>
                    });
                    observer.observe(el);
                })();
            </script>
        </template:addResources>
    </c:otherwise>
</c:choose>
