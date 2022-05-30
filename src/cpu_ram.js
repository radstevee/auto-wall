module.exports = async () => {
    const { run } = require('./index');
    const ram = await Math.round(await run('free | grep Mem | awk \'{print $3/$2 * 100.0}\''));
    const cpu = await Math.round(await run('awk -v a="$(awk \'/cpu /{print $2+$4,$2+$4+$5}\' /proc/stat; sleep 1)" \'/cpu /{split(a,b," "); print 100*($2+$4-b[1])/($2+$4+$5-b[2])}\'  /proc/stat'));
    return {
        ram,
        cpu
    };
};
