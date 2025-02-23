from enum import Enum


class FactureFlSettings(Enum):
    CODE_EXPIRATION_TIME = ""
    CODE_OTP = ""

    @classmethod
    def generate_otp(cls):
        pass
