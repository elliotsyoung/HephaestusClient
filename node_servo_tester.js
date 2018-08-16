const PythonShell = require('python-shell');

PythonShell.run("servo_controller_test_2.py", (err) =>
{
  if (err)
  {
    console.log(err);
  }
});