from evanesca.cli.cli import Cli
from evanesca.config import Context


def main(*argv) -> int:
    import gearshift.commands
    import gearshift.engine.pumps.intake
    Context.CMD_PACKAGES.append(gearshift.commands)
    Context.API_PACKAGES.append(gearshift.engine.pumps.intake)
    return Cli().main(argv)
