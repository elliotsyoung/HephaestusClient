from servosix import ServoSix
import sys
ss = ServoSix()

try:
    while True:
        parsed_message = sys.stdin.readline().split(" ")
        servo = int(parsed_message[0])
        angle = int(parsed_message[1])
        ss.set_servo(servo, angle)
finally:
    print("End of Python process, cleaning up...")
    ss.cleanup()
