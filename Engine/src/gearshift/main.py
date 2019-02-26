from evanesca.cli.cli import Cli
from evanesca.config import Context


def main(*argv) -> int:
    import gearshift.commands
    import gearshift.webhooks
    Context.CMD_PACKAGES.append(gearshift.commands)
    Context.API_PACKAGES.append(gearshift.webhooks)
    return Cli().main(argv)
