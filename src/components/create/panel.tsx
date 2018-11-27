import { Panel } from "azure-devops-ui/Panel";
import { TextField } from "azure-devops-ui/TextField";
import {
    ChoiceGroup,
    Dropdown,
    IChoiceGroupOption,
    IDropdownOption,
    IRenderFunction,
    TooltipHost
} from "office-ui-fabric-react";
import * as React from "react";
import { connect } from "react-redux";
import { ICardSet } from "../../model/cards";
import { SessionMode, SessionSource } from "../../model/session";
import {
    create,
    init,
    setCardSet,
    setIteration,
    setMode,
    setName,
    setSource,
    setTeam
} from "../../pages/create/createActions";
import { IState } from "../../reducer";
import { IIteration, ITeam } from "../../services/teams";
import { getIconForMode } from "../cardIcon";
import { CardSetPicker } from "./cardSetPicker";
import "./panel.scss";

const { icon: onlineIcon, description: onlineDescription } = getIconForMode(
    SessionMode.Online
);
const { icon: offlineIcon, description: offlineDescription } = getIconForMode(
    SessionMode.Offline
);

const renderOptionWithTooltip: IRenderFunction<IChoiceGroupOption> = (
    option: any,
    defaultRender: any
) => {
    return (
        <TooltipHost content={option!.title}>
            {defaultRender!(option)}
        </TooltipHost>
    );
};

const modeOptions: IChoiceGroupOption[] = [
    {
        iconProps: {
            iconName: onlineIcon
        },
        key: SessionMode.Online.toString(),
        text: "Online",
        title: onlineDescription,
        onRenderField: renderOptionWithTooltip
    },
    {
        iconProps: {
            iconName: offlineIcon
        },
        key: SessionMode.Offline.toString(),
        text: "Offline",
        title: offlineDescription,
        onRenderField: renderOptionWithTooltip
    }
];

const sourceOptions: IChoiceGroupOption[] = [
    {
        iconProps: {
            iconName: "Sprint"
        },
        key: SessionSource.Sprint.toString(),
        text: "Sprint",
        onRenderField: renderOptionWithTooltip
    },
    {
        iconProps: {
            iconName: "QueryList"
        },
        key: SessionSource.Query.toString(),
        text: "Query",
        onRenderField: renderOptionWithTooltip
    }
];

export interface ICreatePanelOwnProps {
    onDismiss(): void;
}

interface ICreatePanelProps {
    name: string;
    cardSet: string;
    mode: SessionMode;
    source: SessionSource;
    isValid: boolean;

    teams: ITeam[] | null;
    iterations: IIteration[] | null;

    team: string;
    iteration: string;

    cardSets: ICardSet[];
}

const Actions = {
    onInit: init,
    onSetMode: setMode,
    onSetName: setName,
    onSetSource: setSource,
    onSetTeam: setTeam,
    onSetIteration: setIteration,
    onSetCardSet: setCardSet,
    onCreate: create
};

class CreatePanel extends React.Component<
    ICreatePanelProps & typeof Actions & ICreatePanelOwnProps
> {
    public componentDidMount() {
        this.props.onInit();
    }

    public render(): JSX.Element {
        const {
            name,
            cardSet,
            mode,
            source,
            onDismiss,
            cardSets,
            isValid
        } = this.props;

        return (
            <Panel
                title="Create new session"
                onDismiss={onDismiss}
                footerButtonProps={[
                    { onClick: onDismiss, text: "Cancel" },
                    {
                        onClick: this.onCreate,
                        text: "Create",
                        disabled: !isValid,
                        primary: true
                    }
                ]}
            >
                <div className="create-panel--content">
                    <div className="create-panel--group">
                        <TextField
                            onChange={this.onChangeName}
                            value={name}
                            placeholder="Session title"
                        />
                    </div>

                    <div className="create-panel--group">
                        <label className="create-panel--group-label">
                            Mode
                        </label>
                        <ChoiceGroup
                            selectedKey={mode.toString()}
                            onChanged={this.onChangeMode}
                            options={modeOptions}
                        />
                    </div>

                    <div className="create-panel--group">
                        <label className="create-panel--group-label">
                            Work items
                        </label>
                        <ChoiceGroup
                            selectedKey={source.toString()}
                            onChanged={this.onChangeSource}
                            options={sourceOptions}
                        />

                        {this.renderSourceSelection()}
                    </div>

                    <div className="create-panel--group">
                        <label className="create-panel--group-label">
                            Cards
                        </label>
                        <CardSetPicker
                            cardSets={cardSets}
                            selectedCardSetId={cardSet || ""}
                            onChange={this.onChangeCardSet}
                        />
                    </div>

                    <div className="create-panel--group">
                        <label className="create-panel--group-label">
                            Estimation field
                        </label>

                        <i>
                            Select which field to use for saving the estimated
                            value
                        </i>

                        <Dropdown options={[]} />
                    </div>
                </div>
            </Panel>
        );
    }

    private renderSourceSelection = (): JSX.Element => {
        const { iterations, source, teams, team, iteration } = this.props;

        switch (source) {
            case SessionSource.Query:
                return (
                    <div>
                        <Dropdown label="Query" options={[]} />
                    </div>
                );

            default:
            case SessionSource.Sprint:
                return (
                    <div>
                        <Dropdown
                            onChanged={this.onSetTeam}
                            label="Team"
                            placeHolder="Select Team"
                            selectedKey={team}
                            disabled={teams === null}
                            options={
                                (teams &&
                                    teams.map(t => ({
                                        key: t.id,
                                        text: t.name
                                    }))) || [
                                    { key: "loading", text: "Loading" }
                                ]
                            }
                        />

                        <Dropdown
                            label="Sprint"
                            onChanged={this.onSetIteration}
                            placeHolder="Select Sprint"
                            selectedKey={iteration}
                            disabled={iterations === null}
                            options={
                                (iterations &&
                                    iterations.map(t => ({
                                        key: t.id,
                                        text: t.name
                                    }))) || [
                                    { key: "loading", text: "Loading" }
                                ]
                            }
                        />
                    </div>
                );
        }
    };

    private onChangeName = (ev: React.ChangeEvent, value: string) => {
        const { onSetName } = this.props;
        onSetName(value);
    };

    private onChangeMode = (option: IChoiceGroupOption) => {
        const { onSetMode } = this.props;
        onSetMode(parseInt(option.key, 10) as SessionMode);
    };
    private onChangeSource = (option: IChoiceGroupOption) => {
        const { onSetSource } = this.props;
        onSetSource(parseInt(option.key, 10) as SessionSource);
    };

    private onSetTeam = (option: IDropdownOption) => {
        const { onSetTeam } = this.props;
        onSetTeam(option.key as string);
    };

    private onSetIteration = (option: IDropdownOption) => {
        const { onSetIteration } = this.props;
        onSetIteration(option.key as string);
    };

    private onChangeCardSet = (cardSet: ICardSet) => {
        const { onSetCardSet } = this.props;
        onSetCardSet(cardSet.id);
    };

    private onCreate = () => {
        const { onCreate } = this.props;
        onCreate();
    };
}

export default connect(
    (state: IState) => ({
        name: state.create.session.name,
        cardSet: state.create.session.cardSet,
        mode: state.create.session.mode,
        source: state.create.session.source,
        isValid: state.create.session.name !== "",

        teams: state.create.teams,
        iterations: state.create.iterations,

        team: state.create.team,
        iteration: state.create.iteration,

        cardSets: state.create.cardSets || []
    }),
    Actions
)(CreatePanel);
