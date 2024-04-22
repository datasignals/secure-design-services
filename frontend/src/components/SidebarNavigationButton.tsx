import {Component} from "react";
import {Link} from "react-router-dom";
import {Pages} from "./Sidebar";

interface Props {
    title: string,
    titlePage: Pages,
    imageSrc: string,
    activePage: {
        activePageRoute: Pages,
        callbackChangeActivePage: (p: Pages) => void
    }
    selectedCompany: string,
    requiresCompanyToEnter: boolean
}


//TODO add img prop
export default class SidebarNavigationButton extends Component<Props, {}> {

    constructor(props: Props) {
        super(props);
    }



    render() {
        return this.props.requiresCompanyToEnter ?
            this.renderButtonWithConstraints() :
            this.renderButton();
    }

    private companyExists(): boolean {
        return this.props.selectedCompany !== "N/A";
    }

    private changeActivePageIcon(page: Pages) {
        this.props.activePage.callbackChangeActivePage(page);
    }

    private renderButton() {
        return (
            <li className={this.props.activePage.activePageRoute === this.props.titlePage ? "active" : ""}>
                <Link to={this.props.titlePage}
                      onClick={() =>
                          this.changeActivePageIcon(this.props.titlePage)
                      }>
                    <img src={this.props.imageSrc} alt={this.props.title}/>
                    <span>{this.props.title}</span>
                </Link>
            </li>
        )
    }

    private renderButtonWithConstraints() {
        return (
            <li className={this.props.activePage.activePageRoute === this.props.titlePage ? "active" : ""}>
                {
                    this.companyExists() ?
                        <Link to={this.props.titlePage}
                              onClick={() =>
                                  this.changeActivePageIcon(this.props.titlePage)
                              }>
                            <img src={this.props.imageSrc} alt={this.props.title}/>
                            <span>{this.props.title}</span>
                        </Link> :
                        <a>
                            <img src={this.props.imageSrc} alt={this.props.title}/>
                            <span>{this.props.title}</span>
                        </a>
                }
            </li>
        )
    }

}
