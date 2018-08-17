from servosix import ServoSix
import sys
import time
ss = ServoSix()

servo = int(sys.argv[1])
angle = int(sys.argv[2])
ss.set_servo(servo, angle)
print("turning head %s degrees" % angle)
time.sleep(1)

print("End of Python process, cleaning up...")
ss.cleanup()
print("Finished cleaning up")
