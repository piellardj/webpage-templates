import { ISection } from "../../components/homepage/section/template-interface";

interface IHomepageData {
    description: string;
    title: string;

    sections: ISection[];
}

export { IHomepageData };
