from servosix import ServoSix
import sys
import time
ss = ServoSix()

servo = int(sys.argv[1])
angle = int(sys.argv[2])
ss.set_servo(servo, angle)
print("turning head")
print(servo)
print(angle)
sys.stdout.flush()
time.sleep(1.5)

print("End of Python process, cleaning up...")
ss.cleanup()
