function validateDistributions(distributions) {
    return distributions.reduce(function(errors,distro) {
        return errors.concat(validateDistribution(distro));
    },[]);
}

function validateDistribution(distro) {
    var errors = [];
    function pushError(description) { errors.push({distribution: distro.id, description: description}); }

    try {
        if (!distro.id) { pushError('No id for distro'); }
        if (!distro.name) { pushError('No name for distro'); }
        if (!distro.url) { pushError('No website for distro'); }
        if (distro.releases.length === 0) {
            pushError('No releases');
        }
        distro.releases.forEach(function(release) {
            if (!release) { pushError('Release is null'); return; }
            if (typeof release !== 'object') { pushError('Release is not an object'); return; }
            if (!release.url) { pushError('Release does not have an url'); }
            if (!release.size) { pushError('Release "'+release.url+'" does not have a size'); }
            // Version is optional.
            //if (!release.version) { pushError('Release "'+release.url+'" does not have an version'); }
            if (!/^http:\/\//.test(release.url)) { pushError('Release "'+release.url+'" is not an url'); }
            if (/\s+/.test(release.url)) { pushError('Release "'+release.url+'" has whitespace in its url'); }
            if (distro.releases.filter(function(o) { return o && o.url === release.url; }).length > 1) { pushError('Duplicate url "'+release.url+'".'); }
        });
    } catch (e) {
        pushError('Exception while validating: "' + e + '".');
    }
    return errors;
}

module.exports = {
    validateDistributions: validateDistributions,
    validateDistribution: validateDistribution
};