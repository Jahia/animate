package org.jahia.modules.filter;

import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.filter.AbstractFilter;
import org.jahia.services.render.filter.RenderChain;
import org.jahia.services.render.filter.RenderFilter;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;

@Component(service = RenderFilter.class)
public class AnimateFilter extends AbstractFilter {

    @Activate
    public void activate() {
        setDescription("Filter that add animation to the current resource.");
        setPriority(46);
        setApplyOnNodeTypes("jmix:animate");
        setSkipOnConfigurations("include,wrapper");
        setSkipOnModes("studio");
    }

    @Override
    public String prepare(RenderContext renderContext, Resource resource, RenderChain chain) throws Exception {
        if (resource.getNode().hasProperty("j:animation")) {
            resource.pushWrapper("animate");
        }
        return null;
    }
}
