const PythonShell = require('python-shell');
var options = {
  args: ['1', '180']
};
PythonShell.run("servo_controller_test_2.py", options, (err) =>
{
  if (err)
  {
    console.log(err);
  }
});